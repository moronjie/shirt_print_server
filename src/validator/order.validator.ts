import { z } from 'zod';
import {
  sizeOptions,
  colorOptions,
  printAreaOptions,
} from '../model/products.model';
import {
  orderStatusOptions,
  paymentStatusOptions,
} from '../model/order.model';

const customPrintSchema = z.object({
  area: z.enum(printAreaOptions, {
    message: `Print area must be one of: ${printAreaOptions.join(', ')}`,
  }),
  imageUrl: z.string({ message: 'Image URL is required' }).url('Invalid image URL format'),
});

const orderItemSchema = z.object({
  product: z.string({ message: 'Product ID is required' }).min(1),
  productName: z.string({ message: 'Product name is required' }).min(1),
  size: z.enum(sizeOptions, {
    message: `Size must be one of: ${sizeOptions.join(', ')}`,
  }),
  color: z.enum(colorOptions, {
    message: `Color must be one of: ${colorOptions.join(', ')}`,
  }),
  quantity: z
    .number({ message: 'Quantity is required and must be a number' })
    .int('Quantity must be an integer')
    .positive('Quantity must be at least 1'),
  pricePerUnit: z
    .number({ message: 'Price per unit is required' })
    .nonnegative('Price cannot be negative'),
  customPrints: z.array(customPrintSchema).default([]),
  subtotal: z
    .number({ message: 'Subtotal is required' })
    .nonnegative('Subtotal cannot be negative'),
});

const shippingAddressSchema = z.object({
  name: z
    .string({ message: 'Name is required' })
    .min(1, 'Name cannot be empty')
    .max(100, 'Name is too long'),
  city: z
    .string({ message: 'City is required' })
    .min(1, 'City cannot be empty')
    .max(100, 'City name is too long'),
  phoneNumber: z
    .string({ message: 'Phone number is required' })
    .min(1, 'Phone number cannot be empty')
    .max(20, 'Phone number is too long'),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemSchema)
    .min(1, 'Order must contain at least one item'),
  shippingAddress: shippingAddressSchema,
  total: z
    .number({ message: 'Total is required' })
    .nonnegative('Total cannot be negative'),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(orderStatusOptions, {
    message: `Order status must be one of: ${orderStatusOptions.join(', ')}`,
  }),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(paymentStatusOptions, {
    message: `Payment status must be one of: ${paymentStatusOptions.join(', ')}`,
  }),
});

export const cancelOrderSchema = z.object({
  cancellationReason: z
    .string({ message: 'Cancellation reason is required' })
    .min(1, 'Please provide a reason for cancellation')
    .max(500, 'Cancellation reason is too long'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
