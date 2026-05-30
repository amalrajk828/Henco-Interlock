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
import inquiryRoutes from './routes/inquiryRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environmental parameters
dotenv.config();

// Create uploads directory if not present
const uploadsPath = path.resolve('uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const app = express();

// Set up logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Dynamic CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim()).filter(Boolean) 
  : [];

// Regular expression to match localhost with any port (http/https)
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Regular expression to match any Vercel domain or Vercel preview domain (*.vercel.app)
const vercelRegex = /^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (like mobile app triggers, curl, postman)
    if (!origin) return callback(null, true);
    
    const isLocalhost = localhostRegex.test(origin);
    const isVercel = vercelRegex.test(origin);
    const isAllowedCustom = allowedOrigins.includes(origin);
    
    if (isLocalhost || isVercel || isAllowedCustom) {
      return callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Access denied for origin: ${origin}`);
      return callback(null, false); // Block CORS header inclusion without throwing server error
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Support older browser engines for preflight requests
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight OPTIONS requests for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Statically serve uploaded attachments
app.use('/uploads', express.static(uploadsPath));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Henco Interlock API is live and healthy' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', settingsRoutes);

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

