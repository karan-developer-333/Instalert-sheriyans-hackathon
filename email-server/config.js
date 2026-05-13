import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const requiredEnvVars = [
    'EMAIL_SERVER_SECRET',
    'GOOGLE_USER',
    'EMAIL_FROM',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.warn(`⚠️  Warning: Missing email server environment variables: ${missingEnvVars.join(', ')}`);
}

const config = {
    // Server
    PORT: parseInt(process.env.EMAIL_SERVER_PORT || '3002', 10),
    SECRET: process.env.EMAIL_SERVER_SECRET || '',
    SERVER_URI: process.env.SERVER_URI || 'http://localhost:3001',
    
    // Gmail Config
    GOOGLE_USER: process.env.GOOGLE_USER || process.env.EMAIL_FROM || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || '',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.GOOGLE_USER || 'noreply@instaalert.com',
    
    // Utility functions
    hasOAuth2: () => config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET && config.GOOGLE_REFRESH_TOKEN,
    hasAppPassword: () => config.EMAIL_PASSWORD && config.GOOGLE_USER,
};

export default config;
