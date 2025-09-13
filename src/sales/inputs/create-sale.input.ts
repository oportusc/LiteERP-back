import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsBoolean, IsDate, IsArray, ValidateNested, ArrayMinSize, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class SaleItemInput {
  @Field(() => ID)
  @IsString()
  productId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  total: number;
}

@InputType()
export class CreateSaleInput {
  @Field(() => ID)
  @IsString()
  customerId: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  saleDate: Date;

  @Field(() => [SaleItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleItemInput)
  @ArrayMinSize(1)
  items: SaleItemInput[];

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  subtotal: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  total: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsEnum(['pending', 'paid', 'partial', 'cancelled'])
  paymentStatus?: string;
}
