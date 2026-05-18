import mongoose, { Document, Schema } from 'mongoose';

export const designStatusOptions = [
  'uploaded',
  'used-in-order',
  'approved-as-product',
  'rejected',
] as const;

export type DesignStatus = (typeof designStatusOptions)[number];

export interface IUploadedDesign extends Document {
  imageUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  uploadedBy?: mongoose.Types.ObjectId; // User who uploaded (optional for now)
  status: DesignStatus;
  usedInOrders: mongoose.Types.ObjectId[]; // Array of order IDs using this design
  convertedToProduct?: mongoose.Types.ObjectId; // Product ID if converted
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UploadedDesignSchema: Schema = new Schema<IUploadedDesign>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: designStatusOptions,
      default: 'uploaded',
      index: true,
    },
    usedInOrders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    convertedToProduct: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
    },
  },
  { timestamps: true },
);

// Index for finding unused designs
UploadedDesignSchema.index({ status: 1, createdAt: -1 });

export const UploadedDesign = mongoose.model<IUploadedDesign>(
  'UploadedDesign',
  UploadedDesignSchema,
);
