import { Product, IPrintArea } from '../model/products.model';
import { ICustomPrint } from '../model/order.model';
import CustomError, { errorCodes } from '../middleware/errorHandler';
import HTTP_STATUS from '../config/http.config';

export interface DesignValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PriceBreakdown {
  basePrice: number;
  customPrintPrice: number;
  totalPrice: number;
  numberOfCustomPrints: number;
}

export class DesignService {
  // Pricing constants
  private readonly STANDARD_PRICE = 150; // GHS 150 for pre-made shirts
  private readonly CUSTOM_SINGLE_PRICE = 200; // GHS 200 for one print area
  private readonly CUSTOM_DOUBLE_PRICE = 220; // GHS 220 for front + back

  /**
   * Validate custom prints against product's available print areas
   */
  async validateCustomDesign(
    productId: string,
    customPrints: ICustomPrint[],
  ): Promise<DesignValidationResult> {
    const errors: string[] = [];

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return {
        isValid: false,
        errors: ['Product not found'],
      };
    }

    if (!product.printAreas || product.printAreas.length === 0) {
      return {
        isValid: false,
        errors: ['This product does not support custom printing'],
      };
    }

    const availableAreas = product.printAreas.map((pa) => pa.area);

    for (const customPrint of customPrints) {
      if (!availableAreas.includes(customPrint.area)) {
        errors.push(
          `Print area "${customPrint.area}" is not available for this product. Available areas: ${availableAreas.join(', ')}`,
        );
      }

      if (!customPrint.imageUrl) {
        errors.push(`Image URL is required for print area "${customPrint.area}"`);
      }
    }

    const printAreas = customPrints.map((cp) => cp.area);
    const uniqueAreas = new Set(printAreas);
    if (printAreas.length !== uniqueAreas.size) {
      errors.push('Duplicate print areas are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async calculatePrice(
    productId: string,
    quantity: number,
    customPrints: ICustomPrint[] = [],
  ): Promise<PriceBreakdown> {
    const product = await Product.findById(productId);

    if (!product) {
      throw new CustomError(
        'Product not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const numberOfCustomPrints = customPrints.length;
    const isCustomized = numberOfCustomPrints > 0;
    
    let pricePerUnit: number;
    let customPrintPrice: number;
    
    if (numberOfCustomPrints === 0) {
      pricePerUnit = this.STANDARD_PRICE;
      customPrintPrice = 0;
    } else if (numberOfCustomPrints === 1) {
      pricePerUnit = this.CUSTOM_SINGLE_PRICE;
      customPrintPrice = this.CUSTOM_SINGLE_PRICE - this.STANDARD_PRICE;
    } else {
      pricePerUnit = this.CUSTOM_DOUBLE_PRICE;
      customPrintPrice = this.CUSTOM_DOUBLE_PRICE - this.STANDARD_PRICE;
    }
    
    const basePrice = this.STANDARD_PRICE;
    const totalPrice = pricePerUnit * quantity;

    return {
      basePrice,
      customPrintPrice,
      totalPrice,
      numberOfCustomPrints,
    };
  }

  async getPrintAreas(productId: string): Promise<IPrintArea[]> {
    const product = await Product.findById(productId);

    if (!product) {
      throw new CustomError(
        'Product not found',
        errorCodes.RESOURCE_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return product.printAreas || [];
  }

  async validateProductOptions(
    productId: string,
    size: string,
    color: string,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const product = await Product.findById(productId);
    if (!product) {
      return {
        isValid: false,
        errors: ['Product not found'],
      };
    }

    if (!product.availableSizes.includes(size as any)) {
      errors.push(
        `Size "${size}" is not available. Available sizes: ${product.availableSizes.join(', ')}`,
      );
    }

    if (!product.availableColors.includes(color as any)) {
      errors.push(
        `Color "${color}" is not available. Available colors: ${product.availableColors.join(', ')}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default new DesignService();
