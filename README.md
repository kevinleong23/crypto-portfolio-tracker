# Crypto Portfolio Tracker

A web application for tracking cryptocurrency portfolios across multiple exchanges and wallets.

## Features

- 📊 Real-time portfolio tracking
- 🔗 Exchange integration (MEXC, Binance)
- 👛 Wallet integration (MetaMask, Phantom)
- 📈 Performance charts and analytics
- 🔒 Secure API key encryption
- 🌙 Dark mode UI
- 📱 Desktop-focused design

## Tech Stack

**Frontend:**
- React + Vite
- Tailwind CSS
- Chart.js
- Axios

**Backend:**
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- AES-256 Encryption

**Hosting:**
- Firebase

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Exchange API keys (read-only)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `backend/.env`:
```
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-32-character-key
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. In the root directory, install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
crypto-portfolio-tracker/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── App.jsx            # Main app component
├── backend/               # Backend source
│   └── src/
│       ├── models/        # MongoDB models
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       ├── middleware/    # Express middleware
│       └── server.js      # Server entry point
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Portfolio
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/portfolio/performance/:timeframe` - Get performance data
- `POST /api/portfolio/sync` - Sync portfolio

### Integrations
- `GET /api/integration` - Get all integrations
- `POST /api/integration/exchange` - Add exchange
- `POST /api/integration/wallet` - Add wallet
- `DELETE /api/integration/:id` - Remove integration

### Transactions
- `GET /api/transactions/recent` - Get recent transactions
- `GET /api/transactions/asset/:symbol` - Get asset transactions

## Security

- API keys are encrypted using AES-256
- JWT authentication for all protected routes
- Read-only exchange API keys recommended
- HTTPS required in production

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init
```

3. Build and deploy:
```bash
npm run build
firebase deploy
```

## Important Notes

- This is a desktop-focused application
- Exchange API keys should be read-only
- Regular syncing is automated every 15 minutes
- Performance history is retained for 1 year

## License

This is a Final Year Project - Educational Use Only