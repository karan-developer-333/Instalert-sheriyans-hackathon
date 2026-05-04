import { config } from 'dotenv';
config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import fs from 'fs'
import morgan from 'morgan'
import path from 'path'

import authRoutes from './routes/auth.route.js';
import adminRoutes from './routes/admin.route.js';
import userRoutes from './routes/user.route.js';
import organizationRoutes from './routes/organization.route.js';
import incidentRoutes from './routes/incident.route.js';
import errorRoutes from './routes/error.route.js';
import apiKeyRoutes from './routes/apikey.route.js';


const app = express();

// setup the logger
app.use(morgan('dev'))

const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/organization', organizationRoutes);
app.use('/incidents', incidentRoutes);
app.use('/api/error', errorRoutes);
app.use('/apikey', apiKeyRoutes);

export default app;
