import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { BadRequestError } from '../utils/AppError';

/**
 * Multer middleware for file uploads.
 * Handles profile image and CSV file uploads.
 */

// Storage configuration for profile images (Memory storage for Cloudinary)
const imageStorage = multer.memoryStorage();

// File filter for images
const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only JPEG, PNG, GIF, and WebP images are allowed'));
  }
};

// CSV file filter
const csvFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only CSV files are allowed'));
  }
};

export const uploadProfileImage = multer({
  storage: imageStorage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: imageFilter,
}).single('profileImage');

export const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for CSV
  fileFilter: csvFilter,
}).single('file');
