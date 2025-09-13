import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

// Sub-esquema para la receta del mix
@Schema({ _id: false })
export class ProductRecipe {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  cantidad: number;

  @Prop({ required: true, enum: ['kg', 'g', 'lb', 'oz'] })
  unidad: string;
}

const ProductRecipeSchema = SchemaFactory.createForClass(ProductRecipe);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ min: 0, default: 0 })
  currentStock: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplierId: Types.ObjectId;

  // Campos para información de compra
  @Prop({ min: 0 })
  purchaseQuantity: number; // Cantidad de compra (ej: 1000)

  @Prop({ enum: ['kg', 'g', 'gr', 'lb', 'oz'] })
  purchaseUnit: string; // Unidad de compra (ej: "g")

  @Prop({ min: 0 })
  purchasePrice: number; // Precio total de compra (ej: 5000)

  // Campos para información de venta
  @Prop({ min: 0 })
  saleQuantity: number; // Cantidad de venta (ej: 250)

  @Prop({ enum: ['kg', 'g', 'gr', 'lb', 'oz'] })
  saleUnit: string; // Unidad de venta (ej: "g")

  @Prop({ min: 0 })
  salePrice: number; // Precio de venta (ej: 3500)

  // Campos calculados de rentabilidad
  @Prop({ min: 0 })
  costPerSaleUnit: number; // Costo por unidad de venta

  @Prop()
  profitMargin: number; // Margen de ganancia en valor absoluto

  @Prop()
  profitPercentage: number; // Porcentaje de ganancia

  // Campo clave para productos mix
  @Prop({ default: false })
  esMix: boolean;

  @Prop({ type: [ProductRecipeSchema] })
  receta: ProductRecipe[];

  // Campos comunes
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índices para mejorar rendimiento
ProductSchema.index({ companyId: 1, isActive: 1 });
ProductSchema.index({ companyId: 1, esMix: 1 });
ProductSchema.index({ name: 1, companyId: 1 }, { unique: true });
