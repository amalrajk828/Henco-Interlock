import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environmental parameters
dotenv.config();



const app = express();

// Set up logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// CORS Debugging Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`[CORS Debug] Method: ${req.method} | Origin: ${origin || 'No Origin'} | Path: ${req.path}`);
  if (req.method === 'OPTIONS') {
    console.log(`[CORS Preflight] Preflight request for path: ${req.path}`);
  }
  next();
});

// Production Permissive CORS Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Henco Interlock API is live and healthy' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Henco Interlock API is live and healthy' });
});

// Mount Routes (Supports both prefixed /api/x and direct /x endpoints for Vercel/Render env consistency)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/categories', categoryRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/admin/products', adminProductRoutes);
app.use('/admin/products', adminProductRoutes);

app.use('/api/inquiries', inquiryRoutes);
app.use('/inquiries', inquiryRoutes);

app.use('/api/projects', projectRoutes);
app.use('/projects', projectRoutes);

app.use('/api/testimonials', testimonialRoutes);
app.use('/testimonials', testimonialRoutes);

app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);

// General Exception Middlewares
app.use(notFound);
app.use(errorHandler);

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✔ Henco server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    }
  });
});

