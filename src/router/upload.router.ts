import { Router } from 'express';
import uploadController from '../controller/upload.controller';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validate';
import { uploadDesignSchema, deleteImageSchema } from '../validator/upload.validator';

const router = Router();

// Upload custom design image (accepts base64 in request body)
router.post(
  '/design',
  validate(uploadDesignSchema),
  asyncHandler((req, res, next) => uploadController.uploadDesign(req, res, next)),
);

// Upload product image (admin only - add auth middleware later)
// Accepts base64 in request body
router.post(
  '/product',
  validate(uploadDesignSchema),
  asyncHandler((req, res, next) => uploadController.uploadProductImage(req, res, next)),
);

// Delete image
router.delete(
  '/',
  validate(deleteImageSchema),
  asyncHandler((req, res, next) => uploadController.deleteImage(req, res, next)),
);

export default router;
