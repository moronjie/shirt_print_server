import { z } from 'zod';
import {
  sizeOptions,
  colorOptions,
  printAreaOptions,
} from '../model/products.model';

const printAreaSchema = z.object({
  area: z.enum(printAreaOptions, {
    message: `Print area must be one of: ${printAreaOptions.join(', ')}`,
  }),
  width: z
    .number({ message: 'Width is required and must be a number' })
    .positive('Width must be greater than 0'),
  height: z
    .number({ message: 'Height is required and must be a number' })
    .positive('Height must be greater than 0'),
  fromTop: z
    .number({ message: 'FromTop is required and must be a number' })
    .nonnegative('FromTop must be 0 or greater'),
  fromLeft: z
    .number({ message: 'FromLeft is required and must be a number' })
    .nonnegative('FromLeft must be 0 or greater'),
});

export const createProductSchema = z.object({
  name: z
    .string({ message: 'Product name is required' })
    .min(1, 'Product name cannot be empty')
    .max(200, 'Product name must be less than 200 characters'),

  description: z
    .string({ message: 'Product description is required' })
    .min(1, 'Product description cannot be empty')
    .max(1000, 'Product description must be less than 1000 characters'),

  price: z
    .number({ message: 'Product price is required and must be a number' })
    .positive('Price must be greater than 0')
    .finite('Price must be a valid number'),

  imageUrl: z
    .string({ message: 'Product image URL is required' })
    .url('Invalid image URL format'),

  availableSizes: z
    .array(
      z.enum(sizeOptions, {
        message: `Size must be one of: ${sizeOptions.join(', ')}`,
      }),
    )
    .min(1, 'At least one size must be selected')
    .refine((sizes) => new Set(sizes).size === sizes.length, {
      message: 'Duplicate sizes are not allowed',
    }),

  availableColors: z
    .array(
      z.enum(colorOptions, {
        message: `Color must be one of: ${colorOptions.join(', ')}`,
      }),
    )
    .min(1, 'At least one color must be selected')
    .refine((colors) => new Set(colors).size === colors.length, {
      message: 'Duplicate colors are not allowed',
    }),

  printAreas: z
    .array(printAreaSchema)
    .min(1, 'At least one print area must be defined')
    .refine(
      (areas) => {
        const areaNames = areas.map((a) => a.area);
        return new Set(areaNames).size === areaNames.length;
      },
      {
        message: 'Duplicate print area locations are not allowed',
      },
    ),

  printImageUrl: z.string().url('Invalid print image URL format').optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;