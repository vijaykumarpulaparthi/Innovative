# Finance Assistant

A comprehensive finance management application with AI assistance capabilities.

## Overview

Finance Assistant is a web application that helps users track and manage their personal finances. The application includes login/signup functionality, dashboard visualization for monthly spending and investments, bank statement PDF processing, and an AI chatbot assistant.

## Features

- User authentication (login/signup)
- Dashboard with visual representation of financial data
- Bank statement PDF upload and processing
- Monthly spending and investment tracking
- AI-powered chatbot assistant for financial guidance
- Responsive UI for all devices

## Tech Stack

### Frontend
- Angular 17+
- Angular Material for UI components
- Chart.js for data visualization
- Angular Router for navigation
- RxJS for reactive programming

### Backend
- FastAPI (Python)
- LangChain for AI capabilities
- LangGraph for conversational AI flow
- SQL Server for database
- JWT for authentication
- PyPDF2/PDFMiner for PDF processing

### Deployment
- Azure App Service for hosting
- Azure SQL Database (production environment)
- Azure Storage for file storage
- Azure OpenAI Service for AI capabilities

## Project Structure

```
finance-assistant/
├── frontend/                 # Angular application
│   ├── src/                  # Source files
│   ├── angular.json          # Angular configuration
│   └── ...
├── backend/                  # FastAPI application
│   ├── app/                  # Application code
│   ├── requirements.txt      # Python dependencies
│   └── ...
├── infra/                    # Azure infrastructure as code
│   ├── main.bicep            # Main Bicep template
│   └── ...
└── README.md                 # Project documentation
```

## Development Setup

### Prerequisites
- Node.js (v18+)
- Angular CLI
- Python (3.10+)
- SQL Server
- Azure CLI

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Deployment

The application is configured for deployment to Azure using Bicep templates located in the `infra/` directory.

```bash
cd infra
az login
az deployment group create --resource-group myResourceGroup --template-file main.bicep
```

## License

[MIT](LICENSE)
