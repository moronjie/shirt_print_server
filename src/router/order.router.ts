import { Router } from 'express';
import orderController from '../controller/order.controller';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  cancelOrderSchema,
} from '../validator/order.validator';

const router = Router();

// Create a new order
router.post(
  '/',
  validate(createOrderSchema),
  asyncHandler((req, res, next) => orderController.createOrder(req, res, next)),
);

// Get all orders (admin route - should add auth middleware)
router.get('/', asyncHandler((req, res, next) => orderController.getOrders(req, res, next)));

// Get user's orders
router.get(
  '/user/:userId',
  asyncHandler((req, res, next) => orderController.getUserOrders(req, res, next)),
);

// Get order by order number
router.get(
  '/number/:orderNumber',
  asyncHandler((req, res, next) => orderController.getOrderByNumber(req, res, next)),
);

// Get order by ID
router.get('/:id', asyncHandler((req, res, next) => orderController.getOrderById(req, res, next)));

// Update order status
router.patch(
  '/:id/status',
  validate(updateOrderStatusSchema),
  asyncHandler((req, res, next) => orderController.updateOrderStatus(req, res, next)),
);

// Update payment status
router.patch(
  '/:id/payment',
  validate(updatePaymentStatusSchema),
  asyncHandler((req, res, next) => orderController.updatePaymentStatus(req, res, next)),
);

// Cancel order
router.post(
  '/:id/cancel',
  validate(cancelOrderSchema),
  asyncHandler((req, res, next) => orderController.cancelOrder(req, res, next)),
);

export default router;
