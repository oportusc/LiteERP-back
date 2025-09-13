import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ProductRecipeInput {
  @Field()
  @IsString()
  productId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @Field()
  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  unidad: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string;

  // Campos para información de compra
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  purchaseUnit?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  // Campos para información de venta
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saleQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  saleUnit?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  esMix?: boolean;

  @Field(() => [ProductRecipeInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeInput)
  @ArrayMinSize(1)
  receta?: ProductRecipeInput[];
}
