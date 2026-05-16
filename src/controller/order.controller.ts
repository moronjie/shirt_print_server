import { Request, Response, NextFunction } from 'express';
import { Order } from '../model/order.model';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';

export class OrdersController {
  async createOrder(req: Request, res: Response, _next: NextFunction) {
    // TODO: Get user ID from auth session
    const userId = req.body.user || 'temp-user-id';

    const order = await Order.create({
      ...req.body,
      user: userId,
    });

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
