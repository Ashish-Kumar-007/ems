import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { logger } from './logger';

// Configure Cloudinary (requires CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary via stream
 * @param buffer The file buffer
 * @param folder The target folder in Cloudinary
 * @returns The secure URL of the uploaded image
 */
export const uploadBufferToCloudinary = (buffer: Buffer, folder: string = 'ems/profiles'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
