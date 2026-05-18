import { Request, Response, NextFunction } from 'express';
import { Order } from '../model/order.model';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';
import designService from '../service/design.service';
import { Product } from '../model/products.model';
import { UploadedDesign } from '../model/uploadedDesign.model';

export class OrdersController {
  async createOrder(req: Request, res: Response, _next: NextFunction) {
    // TODO: Get user ID from auth session
    const userId = req.body.user || 'temp-user-id';

    // Validate and calculate prices for each item
    let calculatedTotal = 0;

    for (const item of req.body.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new CustomError(
          `Product with ID ${item.product} not found`,
          errorCodes.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
        );
      }

      // Validate size and color
      const optionsValidation = await designService.validateProductOptions(
        item.product,
        item.size,
        item.color,
      );

      if (!optionsValidation.isValid) {
        throw new CustomError(
          optionsValidation.errors.join(', '),
          errorCodes.VALIDATION_ERROR,
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      // Validate custom prints if provided
      if (item.customPrints && item.customPrints.length > 0) {
        const designValidation = await designService.validateCustomDesign(
          item.product,
          item.customPrints,
        );

        if (!designValidation.isValid) {
          throw new CustomError(
            designValidation.errors.join(', '),
            errorCodes.VALIDATION_ERROR,
            HTTP_STATUS.BAD_REQUEST,
          );
        }
      }

      // Calculate actual price (server-side)
      const priceBreakdown = await designService.calculatePrice(
        item.product,
        item.quantity,
        item.customPrints || [],
      );

      // Update item with calculated values
      const numberOfPrints = item.customPrints?.length || 0;
      if (numberOfPrints === 0) {
        item.pricePerUnit = 150; // Standard
      } else if (numberOfPrints === 1) {
        item.pricePerUnit = 200; // Single print (Front OR Back)
      } else {
        item.pricePerUnit = 220; // Multiple prints (Front AND Back)
      }
      item.subtotal = priceBreakdown.totalPrice;
      item.productName = product.name;

      calculatedTotal += priceBreakdown.totalPrice;
    }

    // Override client-sent total with server-calculated total
    const order = await Order.create({
      ...req.body,
      user: userId,
      total: calculatedTotal,
    });

    // Mark designs as used in this order
    const designUrls = req.body.items
      .flatMap((item: any) => item.customPrints || [])
      .map((cp: any) => cp.imageUrl)
      .filter(Boolean);

    if (designUrls.length > 0) {
      await UploadedDesign.updateMany(
        { imageUrl: { $in: designUrls } },
        {
          $set: { status: 'used-in-order' },
          $addToSet: { usedInOrders: order._id },
        },
      );
    }

    await order.populate('items.product');

    res.status(201).json({
      success: true,
      data: order,
    });
  }

  async getOrders(req: Request, res: Response, _next: NextFunction) {
    // TODO: Filter by user ID from auth session
    const orders = await Order.find()
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  }

  async getOrderById(req: Request, res: Response, _next: NextFunction) {
    const order = await Order.findById(req.params.id).populate(
      'items.product',
    );

    if (!order) {
      throw new CustomError(
        'Order not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // TODO: Check if order belongs to authenticated user

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  async getOrderByNumber(req: Request, res: Response, _next: NextFunction) {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
    }).populate('items.product');

    if (!order) {
      throw new CustomError(
        'Order not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  async updateOrderStatus(req: Request, res: Response, _next: NextFunction) {
    const updateData: any = {
      orderStatus: req.body.orderStatus,
    };

    if (req.body.orderStatus === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate('items.product');

    if (!order) {
      throw new CustomError(
        'Order not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  async updatePaymentStatus(req: Request, res: Response, _next: NextFunction) {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true, runValidators: true },
    ).populate('items.product');

    if (!order) {
      throw new CustomError(
        'Order not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  async cancelOrder(req: Request, res: Response, _next: NextFunction) {
    const order = await Order.findById(req.params.id);

    if (!order) {
      throw new CustomError(
        'Order not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new CustomError(
        `Cannot cancel order with status: ${order.orderStatus}`,
        errorCodes.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.cancellationReason;

    await order.save();
    await order.populate('items.product');

    res.status(200).json({
      success: true,
      data: order,
    });
  }

  async getUserOrders(req: Request, res: Response, _next: NextFunction) {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  }
}

export default new OrdersController();
