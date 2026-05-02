import { getConfig } from '../../config/env.js';
import { v2 as cloudinary } from 'cloudinary';

const { cloudinary: cloudinaryConfig } = getConfig();

/**
 * Cloudinary Configuration
 * Uses environment variables for secure setup
 */
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName!,
  api_key: cloudinaryConfig.apiKey!,
  api_secret: cloudinaryConfig.apiSecret!,
});

/**
 * Upload file to Cloudinary
 */
export const uploadToCloudinary = async (file: string, folder: string = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'auto', // supports images, videos, etc.
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    throw new Error('Cloudinary upload failed');
  }
};

export const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const file = parts.slice(-2).join('/'); // folder/filename.ext
    return file.replace(/\.[^/.]+$/, ''); // remove extension
  } catch {
    return null;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string | null) => {
  try {
    if (!publicId) throw new Error('Invalid public id');
    publicId = extractPublicId(publicId);
    if (!publicId) throw new Error('Invalid public id');
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error('Cloudinary delete failed');
  }
};

export default cloudinary;
