import { Request, Response, NextFunction } from 'express';
import cloudinaryService from '../service/cloudinary.service';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';
import { UploadedDesign } from '../model/uploadedDesign.model';

export class UploadController {
  async uploadDesign(req: Request, res: Response, _next: NextFunction) {
    const { image, base64 } = req.body;
    const base64Data = image || base64;

    if (!base64Data) {
      throw new CustomError(
        'No image data provided. Please send base64 string in "image" or "base64" field',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (typeof base64Data !== 'string') {
      throw new CustomError(
        'Image data must be a string',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (base64Data.length < 100) {
      throw new CustomError(
        'Invalid image data - too short',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const estimatedSize = (base64Data.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; 

    if (estimatedSize > maxSize) {
      throw new CustomError(
        'Image size exceeds 5MB limit',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await cloudinaryService.uploadCustomDesign(base64Data);

    // Save design to database for future use as product
    const uploadedDesign = await UploadedDesign.create({
      imageUrl: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadedBy: req.user?.id, // Will be undefined until auth is implemented
      status: 'uploaded',
      metadata: {
        userAgent: req.headers['user-agent'],
        // ipAddress: req.ip, // Optional: track IP
      },
    });

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        designId: uploadedDesign._id, // Return design ID for tracking
      },
    });
  }

  async uploadProductImage(req: Request, res: Response, _next: NextFunction) {
    const { image, base64 } = req.body;
    const base64Data = image || base64;

    if (!base64Data) {
      throw new CustomError(
        'No image data provided. Please send base64 string in "image" or "base64" field',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (typeof base64Data !== 'string') {
      throw new CustomError(
        'Image data must be a string',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const result = await cloudinaryService.uploadProductImage(base64Data);

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  }

  async deleteImage(req: Request, res: Response, _next: NextFunction) {
    const { publicId } = req.body;

    if (!publicId) {
      throw new CustomError(
        'Public ID is required',
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await cloudinaryService.deleteImage(publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  }
}

export default new UploadController();
