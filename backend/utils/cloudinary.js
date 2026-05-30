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
 * @param {string} publicId - The Cloudinary asset public ID
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!publicId || ['legacy', 'local'].includes(publicId) || publicId.startsWith('/uploads')) {
    return;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary Delete] Result for public_id "${publicId}":`, result);
  } catch (error) {
    console.error(`[Cloudinary Delete Failed] Failed to delete image ${publicId}:`, error.message);
  }
};
