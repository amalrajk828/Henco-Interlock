import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete an image from Cloudinary using its public ID
 * @param {string} public_id - The Cloudinary asset public ID
 */
export const deleteImageFromCloudinary = async (public_id) => {
  if (!public_id || ['legacy', 'local'].includes(public_id) || public_id.startsWith('/uploads')) {
    return;
  }
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log(`[Cloudinary Delete] Result for public_id "${public_id}":`, result);
  } catch (error) {
    console.error(`[Cloudinary Delete Failed] Failed to delete image ${public_id}:`, error.message);
  }
};
