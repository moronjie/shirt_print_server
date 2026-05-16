import { Router } from 'express';
import productsController from '../controller/products.controller';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createProductSchema,
  updateProductSchema,
} from '../validator/products.validator';

const router = Router();

router.post(
  '/',
  validate(createProductSchema),
  asyncHandler((req, res, next) => productsController.createProduct(req, res, next)),
);

router.get('/', asyncHandler((req, res, next) => productsController.getProducts(req, res, next)));

router.get('/:id', asyncHandler((req, res, next) => productsController.getProductById(req, res, next)));

router.put(
  '/:id',
  validate(updateProductSchema),
  asyncHandler((req, res, next) => productsController.updateProduct(req, res, next)),
);

router.delete(
  '/:id',
  asyncHandler((req, res, next) => productsController.deleteProduct(req, res, next)),
);

export default router;
