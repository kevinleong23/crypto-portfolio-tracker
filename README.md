# Crypto Portfolio Tracker

A web application for tracking cryptocurrency portfolios across multiple exchanges and wallets.

## Features

  - 📊 **Real-time Portfolio Tracking**: Monitor the total value of your crypto assets, along with 24-hour changes.
  - 🔗 **Exchange & Wallet Integration**: Connect to popular exchanges like MEXC and Binance, and wallets like MetaMask and Phantom.
  - 📈 **Performance Analytics**: Visualize your portfolio's performance over various timeframes with interactive charts.
  - 🔒 **Secure**: API keys are encrypted using AES-256 to protect your sensitive information.
  - 🔑 **Authentication**: Secure user authentication with JWT, including support for two-factor authentication (2FA) and Google OAuth.
  - 🖼️ **Profile Customization**: Users can update their username and profile picture.
  - 🌙 **Dark Mode UI**: A sleek and modern dark mode interface.

## Tech Stack

**Frontend:**

  - [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Chart.js](https://www.chartjs.org/) for charting
  - [Axios](https://axios-http.com/) for API requests

**Backend:**

  - [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) with [Mongoose](https://mongoosejs.com/)
  - [JSON Web Tokens (JWT)](https://jwt.io/) for Authentication
  - AES-256 Encryption for API keys

## Getting Started

### Prerequisites

  - Node.js (v14+)
  - MongoDB Atlas account
  - Read-only API keys from your exchanges

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    PORT=5000
    MONGODB_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    ENCRYPTION_KEY=<your-32-character-encryption-key>
    EMAIL_USER=<your-gmail-address>
    EMAIL_PASS=<your-gmail-app-password>
    ETHERSCAN_API_KEY=<your-etherscan-api-key>
    SOLANA_RPC_URL=<your-solana-rpc-url>
    COINGECKO_API_KEY=<your-coingecko-api-key>
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  In the root directory, install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root directory and add the following environment variable:
    ```
    VITE_API_URL=http://localhost:5000/api
    VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

```
crypto-portfolio-tracker/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   └── App.jsx             # Main app component
├── backend/                # Backend source
│   └── src/
│       ├── models/         # MongoDB models
│       ├── routes/         # API routes
│       ├── services/       # Business logic
│       ├── middleware/     # Express middleware
│       └── server.js       # Server entry point
└── README.md
```

## API Endpoints

### Authentication

  - `POST /api/auth/register`: User registration
  - `POST /api/auth/login`: User login
  - `POST /api/auth/login/2fa`: 2FA login verification
  - `POST /api/auth/google`: Google OAuth
  - `POST /api/auth/forgot-password`: Request password reset OTP
  - `POST /api/auth/verify-otp`: Verify password reset OTP
  - `POST /api/auth/reset-password`: Reset password

### User

  - `GET /api/user/profile`: Get user profile
  - `PATCH /api/user/profile`: Update username
  - `POST /api/user/profile-picture`: Upload profile picture
  - `POST /api/user/change-password`: Change password
  - `POST /api/user/2fa/generate`: Generate 2FA secret
  - `POST /api/user/2fa/verify`: Verify and enable 2FA
  - `POST /api/user/2fa/disable`: Disable 2FA
  - `DELETE /api/user/profile`: Delete account

### Portfolio

  - `GET /api/portfolio/summary`: Get portfolio summary
  - `GET /api/portfolio/performance/:timeframe`: Get performance data
  - `GET /api/portfolio/assets`: Get all assets
  - `POST /api/portfolio/sync`: Sync portfolio

### Integrations

  - `GET /api/integration`: Get all integrations
  - `POST /api/integration/exchange`: Add an exchange
  - `POST /api/integration/wallet`: Add a wallet
  - `DELETE /api/integration/:id`: Remove an integration
  - `PATCH /api/integration/:id`: Update integration display name

### Transactions

  - `GET /api/transactions/recent`: Get recent transactions
  - `GET /api/transactions/recent/:integrationId`: Get recent transactions for a specific wallet
  - `GET /api/transactions/asset/:symbol`: Get transactions by asset

## License

This is a Final Year Project - Educational Use Only