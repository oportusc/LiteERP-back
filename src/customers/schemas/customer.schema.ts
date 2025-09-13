import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  @Prop({ trim: true })
  contactPerson: string;

  @Prop({ trim: true })
  notes: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Índices
CustomerSchema.index({ companyId: 1, isActive: 1 });
CustomerSchema.index({ name: 1, companyId: 1 }, { unique: true });
