import mongoose, { Document, Schema } from 'mongoose';
import {
  SizeOption,
  ColorOption,
  PrintAreaOption,
} from './products.model';

export const orderStatusOptions = [
  'pending',
  'processing',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const paymentStatusOptions = [
  'pending',
  'paid',
  'failed',
  'refunded',
] as const;

export type OrderStatus = (typeof orderStatusOptions)[number];
export type PaymentStatus = (typeof paymentStatusOptions)[number];

export interface ICustomPrint {
  area: PrintAreaOption;
  imageUrl: string;
}

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string; 
  size: SizeOption;
  color: ColorOption;
  quantity: number;
  pricePerUnit: number; 
  customPrints: ICustomPrint[];
  subtotal: number;
}

export interface IShippingAddress {
  name: string;
  city: string;
  phoneNumber: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const CustomPrintSchema = new Schema<ICustomPrint>(
  {
    area: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    customPrints: {
      type: [CustomPrintSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const OrderSchema: Schema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: orderStatusOptions,
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: paymentStatusOptions,
      default: 'pending',
      index: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.pre('save', async function () {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);