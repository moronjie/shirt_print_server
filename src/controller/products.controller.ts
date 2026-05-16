import { Request, Response, NextFunction } from 'express';
import { Product } from '../model/products.model';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';

export class ProductsController {
  async createProduct(req: Request, res: Response, _next: NextFunction) {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  }

  async getProducts(req: Request, res: Response, _next: NextFunction) {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      data: products,
    });
  }

  async getProductById(req: Request, res: Response, _next: NextFunction) {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new CustomError(
        'Product not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async updateProduct(req: Request, res: Response, _next: NextFunction) {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new CustomError(
        'Product not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }

  async deleteProduct(req: Request, res: Response, _next: NextFunction) {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      throw new CustomError(
        'Product not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }
}

export default new ProductsController();
