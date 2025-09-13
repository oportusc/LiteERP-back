import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { SuppliersResolver } from './suppliers.resolver';
import { Supplier, SupplierSchema } from './schemas/supplier.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Supplier.name, schema: SupplierSchema }])
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService, SuppliersResolver],
  exports: [SuppliersService],
})
export class SuppliersModule {}
