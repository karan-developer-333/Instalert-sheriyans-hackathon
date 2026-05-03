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


const app = express();

// create a write stream (in append mode)

// setup the logger
app.use(morgan('dev'))

app.use(cors({
  origin: process.env.CLIENT_URL || ["https://f1rr36mb-5173.inc1.devtunnels.ms", 'http://localhost:5173'],
  methods:["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders:["Content-type","Authorization"],
  credentials: true
}));

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

export default app;
