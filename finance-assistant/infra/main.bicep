@description('The environment name. This will be used as a prefix for all resources.')
param environmentName string = 'finance'

@description('The Azure region for all resources.')
param location string = resourceGroup().location

@description('The name of the SQL Server administrator.')
param sqlAdministratorLogin string

@description('The password of the SQL Server administrator.')
@secure()
param sqlAdministratorLoginPassword string

@description('The App Service SKU name.')
param appServiceSku string = 'B1'

@description('The storage account SKU name.')
param storageAccountSku string = 'Standard_LRS'

@description('The App Service name suffix.')
param appServiceNameSuffix string = 'app'

@description('The SQL Server name suffix.')
param sqlServerNameSuffix string = 'sql'

@description('The storage account name suffix.')
param storageAccountNameSuffix string = 'sa'

// Tags
var tags = {
  'azd-env-name': environmentName
  application: 'finance-assistant'
  environment: environmentName
}

// Resource names
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var appServiceName = '${environmentName}-${appServiceNameSuffix}-${resourceToken}'
var sqlServerName = '${environmentName}-${sqlServerNameSuffix}-${resourceToken}'
var sqlDatabaseName = 'finance'
var storageAccountName = '${environmentName}${storageAccountNameSuffix}${resourceToken}'
var appServicePlanName = '${environmentName}-plan-${resourceToken}'
var appInsightsName = '${environmentName}-ai-${resourceToken}'
var logAnalyticsName = '${environmentName}-la-${resourceToken}'

// Create Log Analytics workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// Create Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// Create App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: appServiceSku
  }
  properties: {}
}

// Create App Service for Frontend
resource frontendAppService 'Microsoft.Web/sites@2022-03-01' = {
  name: '${appServiceName}-frontend'
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      cors: {
        allowedOrigins: ['https://${backendAppService.properties.defaultHostName}']
        supportCredentials: true
      }
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'API_URL'
          value: 'https://${backendAppService.properties.defaultHostName}'
        }
      ]
    }
  }
}

// Create App Service for Backend
resource backendAppService 'Microsoft.Web/sites@2022-03-01' = {
  name: '${appServiceName}-backend'
  location: location
  tags: tags
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      alwaysOn: true
      cors: {
        allowedOrigins: ['https://${frontendAppService.properties.defaultHostName}']
        supportCredentials: true
      }
      appSettings: [
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'DATABASE_SERVER'
          value: '${sqlServer.name}.database.windows.net'
        }
        {
          name: 'DATABASE_NAME'
          value: sqlDatabase.name
        }
        {
          name: 'DATABASE_USER'
          value: sqlAdministratorLogin
        }
        {
          name: 'DATABASE_PASSWORD'
          value: sqlAdministratorLoginPassword
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'AZURE_STORAGE_CONTAINER_NAME'
          value: 'bank-statements'
        }
      ]
      linuxFxVersion: 'PYTHON|3.10'
    }
  }
}

// Create SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorLoginPassword
    version: '12.0'
  }
}

// Create SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

// Allow Azure services to access SQL Server
resource sqlServerFirewallRule 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAllAzureIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Create Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: storageAccountSku
  }
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
  }
}

// Create Blob Container for bank statements
resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/bank-statements'
  properties: {
    publicAccess: 'None'
  }
}

// Outputs
output frontendUrl string = 'https://${frontendAppService.properties.defaultHostName}'
output backendUrl string = 'https://${backendAppService.properties.defaultHostName}'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output storageAccountName string = storageAccount.name
