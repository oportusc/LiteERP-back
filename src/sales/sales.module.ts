import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { SalesResolver } from './sales.resolver';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    forwardRef(() => ProductsModule),
    CustomersModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesResolver],
  exports: [SalesService],
})
export class SalesModule {}
