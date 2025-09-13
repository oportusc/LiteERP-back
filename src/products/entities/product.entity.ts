import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  unitOfMeasure: string;

  @Field(() => Float, { nullable: true })
  costPerUnit?: number;

  @Field(() => Float)
  currentStock: number;

  @Field({ nullable: true })
  supplierId?: string;

  // Campos para información de compra
  @Field(() => Float, { nullable: true })
  purchaseQuantity?: number;

  @Field({ nullable: true })
  purchaseUnit?: string;

  @Field(() => Float, { nullable: true })
  purchasePrice?: number;

  // Campos para información de venta
  @Field(() => Float, { nullable: true })
  saleQuantity?: number;

  @Field({ nullable: true })
  saleUnit?: string;

  @Field(() => Float, { nullable: true })
  salePrice?: number;

  @Field()
  esMix: boolean;

  @Field(() => [ProductRecipe], { nullable: true })
  receta?: ProductRecipe[];

  @Field()
  isActive: boolean;

  @Field()
  companyId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Campos calculados virtualmente
  @Field(() => Float, { nullable: true })
  calculatedCost?: number;

  @Field(() => Float, { nullable: true })
  availableStock?: number;

  // Campos calculados para análisis de rentabilidad
  @Field(() => Float, { nullable: true })
  costPerSaleUnit?: number; // Costo por unidad de venta

  @Field(() => Float, { nullable: true })
  profitMargin?: number; // Margen de ganancia en valor absoluto

  @Field(() => Float, { nullable: true })
  profitPercentage?: number; // Porcentaje de ganancia
}

@ObjectType()
export class ProductRecipe {
  @Field(() => ID)
  productId: string;

  @Field(() => Float)
  cantidad: number;

  @Field()
  unidad: string;

  // Campo virtual para obtener el producto completo
  @Field(() => Product, { nullable: true })
  product?: Product;
}
