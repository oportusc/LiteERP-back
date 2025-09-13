import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, ArrayMinSize, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductRecipeDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  unidad: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsString()
  supplierId?: string;

  // Campos para información de compra
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseQuantity?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  purchaseUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  // Campos para información de venta
  @IsOptional()
  @IsNumber()
  @Min(0)
  saleQuantity?: number;

  @IsOptional()
  @IsString()
  @IsEnum(['kg', 'g', 'gr', 'lb', 'oz'])
  saleUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @IsOptional()
  @IsBoolean()
  esMix?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeDto)
  @ArrayMinSize(1)
  receta?: ProductRecipeDto[];
}
