import mongoose, { Document, Schema } from 'mongoose';

export const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'] as const;
export const colorOptions = [
  'Red',
  'Blue',
  'Green',
  'Black',
  'White',
] as const;
export const printAreaOptions = [
  'Front',
  'Back',
  'Left Sleeve',
  'Right Sleeve',
] as const;
export type SizeOption = (typeof sizeOptions)[number];
export type ColorOption = (typeof colorOptions)[number];
export type PrintAreaOption = (typeof printAreaOptions)[number];

export interface IPrintArea {
  area: PrintAreaOption;
  width: number; 
  height: number; 
  fromTop: number; 
  fromLeft: number; 
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  availableSizes: SizeOption[];
  availableColors: ColorOption[];
  printAreas: IPrintArea[];
  printImageUrl?: string;
}

const PrintAreaSchema = new Schema<IPrintArea>(
  {
    area: {
      type: String,
      enum: printAreaOptions,
      required: true,
    },
    width: {
      type: Number,
      required: true,
      min: 0,
    },
    height: {
      type: Number,
      required: true,
      min: 0,
    },
    fromTop: {
      type: Number,
      required: true,
      min: 0,
    },
    fromLeft: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    availableSizes: {
      type: [String],
      enum: sizeOptions,
      required: true,
    },
    availableColors: {
      type: [String],
      enum: colorOptions,
      required: true,
    },
    printAreas: {
      type: [PrintAreaSchema],
      required: true,
    },
    printImageUrl: { type: String },
  },
  { timestamps: true },
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
