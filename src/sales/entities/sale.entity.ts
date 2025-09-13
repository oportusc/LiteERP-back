import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';

@ObjectType()
export class SaleItem {
  @Field(() => ID)
  productId: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  total: number;

  // Campo virtual para obtener el producto completo
  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class Sale {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  customerId: string;

  @Field()
  saleDate: Date;

  @Field(() => [SaleItem])
  items: SaleItem[];

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  total: number;

  @Field()
  isPaid: boolean;

  @Field(() => Float)
  paidAmount: number;

  @Field(() => Float, { nullable: true })
  pendingAmount?: number;

  @Field({ nullable: true })
  paymentDate?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  paymentStatus: string;

  @Field()
  isActive: boolean;

  @Field()
  companyId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Campo virtual para obtener el cliente completo
  @Field(() => Customer, { nullable: true })
  customer?: Customer;
}
