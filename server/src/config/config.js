import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenvConfig({ path: './.env' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'MISTRAL_API_KEY',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'EMAIL_SERVER_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Some features may not work correctly.');
}

// Export centralized configuration
const config = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/saas',
  
  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  ALLOWED_ORIGINS: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(url => url.trim()),
  
  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || '',
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  
  // Email Service
  EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL || 'http://localhost:3002',
  EMAIL_SERVER_SECRET: process.env.EMAIL_SERVER_SECRET || '',
  
  // AI Service
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
  
  // Utility functions
  isProduction: () => config.NODE_ENV === 'production',
  isDevelopment: () => config.NODE_ENV === 'development',
  
  // Cookie options
  getCookieOptions: () => ({
    secure: config.isProduction(),
    sameSite: config.isProduction() ? 'none' : 'lax',
  }),
};

export default config;
