import { Router } from 'express';
import designManagementController from '../controller/designManagement.controller';
import { asyncHandler } from '../middleware/errorHandler';
// import { requireAdmin } from '../middleware/auth.middleware'; // Add when auth is ready

const router = Router();

// Get all uploaded designs (admin)
// TODO: Add requireAdmin middleware
router.get(
  '/',
  asyncHandler((req, res, next) =>
    designManagementController.getAllDesigns(req, res, next),
  ),
);

// Get unused designs (potential products)
router.get(
  '/unused',
  asyncHandler((req, res, next) =>
    designManagementController.getUnusedDesigns(req, res, next),
  ),
);

// Get design statistics
router.get(
  '/stats',
  asyncHandler((req, res, next) =>
    designManagementController.getDesignStats(req, res, next),
  ),
);

// Convert design to product
router.post(
  '/:designId/convert',
  asyncHandler((req, res, next) =>
    designManagementController.convertToProduct(req, res, next),
  ),
);

// Reject a design
router.post(
  '/:designId/reject',
  asyncHandler((req, res, next) =>
    designManagementController.rejectDesign(req, res, next),
  ),
);

export default router;
