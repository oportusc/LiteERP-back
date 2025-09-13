import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = Sale & Document;

// Sub-esquema para los items de venta
@Schema({ _id: false })
export class SaleItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 0.01 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  total: number;
}

const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ timestamps: true })
export class Sale {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  saleDate: Date;

  @Prop({ type: [SaleItemSchema], required: true })
  items: SaleItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ min: 0, default: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ min: 0, default: 0 })
  paidAmount: number;

  @Prop({ min: 0 })
  pendingAmount: number;

  @Prop()
  paymentDate: Date;

  @Prop({ trim: true })
  notes: string;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'partial', 'cancelled'] })
  paymentStatus: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

// Índices para mejorar rendimiento
SaleSchema.index({ companyId: 1, isActive: 1 });
SaleSchema.index({ customerId: 1, saleDate: -1 });
SaleSchema.index({ paymentStatus: 1, companyId: 1 });
