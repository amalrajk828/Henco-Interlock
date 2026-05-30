import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Products Storage
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'henco-interlock/products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

export const uploadProducts = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Configure Projects Storage
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'henco-interlock/projects',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

export const uploadProjects = multer({
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Configure Testimonials Storage
const testimonialStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'henco-interlock/testimonials',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

export const uploadTestimonials = multer({
  storage: testimonialStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Deprecated fallback for backward compatibility
export const upload = uploadProducts;
