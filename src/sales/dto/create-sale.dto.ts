import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsArray, ValidateNested, ArrayMinSize, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  total: number;
}

export class CreateSaleDto {
  @IsString()
  customerId: string;

  @IsDate()
  @Type(() => Date)
  saleDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @ArrayMinSize(1)
  items: SaleItemDto[];

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['pending', 'paid', 'partial', 'cancelled'])
  paymentStatus?: string;
}
