import { z } from 'zod';

// Validate base64 image data
const base64ImageRegex = /^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,|^[A-Za-z0-9+/=]+$/;

export const uploadDesignSchema = z.object({
  image: z
    .string({ message: 'Image data is required' })
    .min(100, 'Image data is too short')
    .refine(
      (data) => base64ImageRegex.test(data),
      'Invalid base64 image format',
    )
    .optional(),
  base64: z
    .string({ message: 'Base64 data is required' })
    .min(100, 'Base64 data is too short')
    .refine(
      (data) => base64ImageRegex.test(data),
      'Invalid base64 format',
    )
    .optional(),
}).refine(
  (data) => data.image || data.base64,
  {
    message: 'Either "image" or "base64" field is required',
  },
);

export const deleteImageSchema = z.object({
  publicId: z
    .string({ message: 'Public ID is required' })
    .min(1, 'Public ID cannot be empty'),
});

export type UploadDesignInput = z.infer<typeof uploadDesignSchema>;
export type DeleteImageInput = z.infer<typeof deleteImageSchema>;
