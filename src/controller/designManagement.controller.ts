import { Request, Response, NextFunction } from 'express';
import { UploadedDesign } from '../model/uploadedDesign.model';
import { Product } from '../model/products.model';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';

export class DesignManagementController {
  /**
   * Get all uploaded designs (for admin review)
   */
  async getAllDesigns(req: Request, res: Response, _next: NextFunction) {
    const { status, limit = 50, page = 1 } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const designs = await UploadedDesign.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('uploadedBy', 'name email')
      .populate('convertedToProduct', 'name price');

    const total = await UploadedDesign.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: designs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }

  /**
   * Get designs that haven't been used yet (candidates for products)
   */
  async getUnusedDesigns(req: Request, res: Response, _next: NextFunction) {
    const designs = await UploadedDesign.find({
      status: 'uploaded',
      usedInOrders: { $size: 0 },
      convertedToProduct: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      data: designs,
      message: `Found ${designs.length} unused designs that can become products`,
    });
  }

  /**
   * Convert an uploaded design into a product
   */
  async convertToProduct(req: Request, res: Response, _next: NextFunction) {
    const { designId } = req.params;
    const { name, description, availableSizes, availableColors, printAreas } =
      req.body;

    // Find the design
    const design = await UploadedDesign.findById(designId);
    if (!design) {
      throw new CustomError(
        'Design not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    // Create a new product using the design
    const product = await Product.create({
      name,
      description,
      price: 200, // Default custom price (can be changed by admin)
      imageUrl: design.imageUrl,
      availableSizes,
      availableColors,
      printAreas,
      printImageUrl: design.imageUrl, // The custom design becomes the print
    });

    // Update the design status
    design.status = 'approved-as-product';
    design.convertedToProduct = product._id;
    await design.save();

    res.status(201).json({
      success: true,
      data: {
        product,
        design,
      },
      message: 'Design successfully converted to product',
    });
  }

  /**
   * Reject a design (mark it so it won't be suggested again)
   */
  async rejectDesign(req: Request, res: Response, _next: NextFunction) {
    const { designId } = req.params;

    const design = await UploadedDesign.findByIdAndUpdate(
      designId,
      { status: 'rejected' },
      { new: true },
    );

    if (!design) {
      throw new CustomError(
        'Design not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    res.status(200).json({
      success: true,
      data: design,
      message: 'Design rejected',
    });
  }

  /**
   * Get stats about uploaded designs
   */
  async getDesignStats(req: Request, res: Response, _next: NextFunction) {
    const stats = await UploadedDesign.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await UploadedDesign.countDocuments();
    const unused = await UploadedDesign.countDocuments({
      status: 'uploaded',
      usedInOrders: { $size: 0 },
      convertedToProduct: { $exists: false },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        unusedDesigns: unused,
        byStatus: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  }
}

export default new DesignManagementController();
