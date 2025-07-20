# Finance Assistant Infrastructure

This directory contains the Azure infrastructure as code (IaC) using Bicep for the Finance Assistant application.

## Resources

The deployment creates the following Azure resources:

- **App Service Plan**: Hosts both frontend and backend applications
- **App Service (Frontend)**: Hosts the Angular application
- **App Service (Backend)**: Hosts the FastAPI application
- **SQL Server**: Manages the database
- **SQL Database**: Stores application data
- **Storage Account**: Stores bank statement PDFs
- **Application Insights**: Provides monitoring and telemetry
- **Log Analytics Workspace**: Centralizes logs and metrics

## Deployment

### Prerequisites

1. Azure CLI installed
2. Azure subscription
3. Resource group created

### Steps to Deploy

1. Update parameter values in `main.parameters.json`
2. Log in to Azure:
   ```bash
   az login
   ```

3. Set your subscription:
   ```bash
   az account set --subscription <subscription-id>
   ```

4. Create a resource group if not exists:
   ```bash
   az group create --name <resource-group-name> --location eastus
   ```

5. Deploy the infrastructure:
   ```bash
   az deployment group create \
     --resource-group <resource-group-name> \
     --template-file main.bicep \
     --parameters @main.parameters.json
   ```

### Using Azure Developer CLI (azd)

Alternatively, you can use Azure Developer CLI (azd) to deploy:

```bash
azd up
```

## Infrastructure Security

- SQL Server is configured with firewall rules to allow Azure services
- Storage Account is configured to require HTTPS
- App Services are configured with HTTPS only
- Connection strings and sensitive information are stored as application settings
