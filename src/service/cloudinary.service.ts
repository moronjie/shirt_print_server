import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_KEY,
  api_secret: config.CLOUDINARY_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export class CloudinaryService {
  /**
   * Upload an image to Cloudinary from base64 string
   * @param base64Data - Base64 encoded image string (with or without data:image prefix)
   * @param folder - Folder to store the image in Cloudinary
   * @returns Upload result with URL and metadata
   */
  async uploadImage(
    base64Data: string,
    folder: string = 'shirt-designs',
  ): Promise<UploadResult> {
    try {
      // Ensure the base64 string has the data URI prefix
      let base64String = base64Data;
      if (!base64String.startsWith('data:')) {
        // Add default prefix if not provided
        base64String = `data:image/png;base64,${base64String}`;
      }

      const result = await cloudinary.uploader.upload(base64String, {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Upload product image from base64
   */
  async uploadProductImage(base64Data: string): Promise<UploadResult> {
    return this.uploadImage(base64Data, 'products');
  }

  /**
   * Upload custom design/print image from base64
   */
  async uploadCustomDesign(base64Data: string): Promise<UploadResult> {
    return this.uploadImage(base64Data, 'custom-designs');
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Generate a thumbnail URL
   * @param publicId - The public ID of the image
   * @param width - Thumbnail width
   * @param height - Thumbnail height
   */
  getThumbnailUrl(
    publicId: string,
    width: number = 200,
    height: number = 200,
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto:good' },
      ],
    });
  }
}

export default new CloudinaryService();
