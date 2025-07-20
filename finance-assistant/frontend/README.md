# Finance Assistant Frontend

Angular-based frontend for the Finance Assistant application.

## Setup Instructions

1. Install Angular CLI:
```bash
npm install -g @angular/cli
```

2. Initialize a new Angular project (run this in the frontend directory):
```bash
ng new finance-assistant --routing --style=scss
```

3. Install required dependencies:
```bash
npm install @angular/material @angular/cdk chart.js ng2-charts @auth0/angular-jwt
```

4. Serve the application:
```bash
ng serve
```

## Project Structure

The Angular application is structured as follows:

```
src/
├── app/
│   ├── components/           # Reusable components
│   │   ├── chat-bot/         # AI chat bot component
│   │   ├── navbar/           # Application navigation
│   │   └── ...
│   ├── pages/                # Main application pages
│   │   ├── auth/             # Login/register pages
│   │   ├── dashboard/        # Main dashboard
│   │   ├── upload/           # Bank statement upload
│   │   └── ...
│   ├── services/             # Application services
│   │   ├── auth.service.ts   # Authentication service
│   │   ├── finance.service.ts # Finance data service
│   │   ├── chat.service.ts   # AI chat service
│   │   └── ...
│   ├── models/               # Data models
│   ├── guards/               # Route guards
│   └── interceptors/         # HTTP interceptors
├── assets/                   # Static assets
├── environments/             # Environment configuration
└── ...
```

## Key Components

1. **Authentication Module**: Handles user registration, login, and session management
2. **Dashboard Module**: Displays financial data with charts and statistics
3. **Upload Module**: Handles bank statement PDF uploads and processing
4. **Chat Bot Component**: Provides AI-powered financial assistance
5. **Services**: Handle API communication with the backend

## Styling

The application uses Angular Material components with a custom theme for consistent styling.
