# InstaAlert Setup Guide

### 📺 [Watch the Pitch Video](https://drive.google.com/file/d/1lP5-SDls3e8zHMflQ9uBlpajKsKDrK8j/view?usp=sharing)


## Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or Atlas)
- npm or yarn

## Project Structure
```
Instalert-sheriyans-hackathon/
├── client/          # React frontend
├── server/          # Express backend
└── README.md       # This file
```

## Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
MONGO_URI=your-mongodb-connection-string
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
MISTRAL_API_KEY=your-mistral-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

Note: `react-cookie` is already included in the package.json for client-side cookie management.

3. Create a `.env` file in the `client` directory:
```env
VITE_SERVER_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## Authentication & Cookies

The app uses `react-cookie` for client-side cookie management:

- **Login**: On successful login, the server sets an `httpOnly` cookie and also returns the token in the response body. The client stores the token in a readable cookie for persistence across page refreshes.

- **Auth Check**: On app load, `AuthLoader` checks for the token cookie before making a request to `/auth/me`.

- **Logout**: Clears the cookie and dispatches logout action.

## Features

- **Landing Page**: Simplified with Hero, Features, and CTA sections
- **Authentication**: Email/password + GitHub OAuth + OTP verification
- **Role-based Access**: Admin, Organization, and User roles
- **Incident Management**: Create, update, and track incidents
- **Real-time Updates**: Socket.io for live incident updates
- **AI Scoring**: Automated message scoring for incidents

## Available Scripts

### Server
- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

1. **CORS Issues**: Make sure `FRONTEND_URL` in server `.env` matches your client URL.

2. **Cookie Not Set**: In development, cookies use `sameSite: 'lax'`. In production, it switches to `sameSite: 'none'` with `secure: true`.

3. **MongoDB Connection**: Verify your `MONGO_URI` is correct and the database is accessible.

4. **Page Reload on Login**: Fixed by using `react-cookie` to persist auth state. The `AuthLoader` component now checks for the token cookie before making auth requests.
