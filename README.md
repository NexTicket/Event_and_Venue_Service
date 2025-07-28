# EVMS Backend

Event and Venue Management System - Backend API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/NexTicket/EVMS.git
cd EVMS
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Start the server
```bash
npm start
# or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:3000`

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-restart)

## Environment Variables

Create a `.env` file in the root directory with:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```
