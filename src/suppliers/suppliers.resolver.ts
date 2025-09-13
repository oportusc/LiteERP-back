import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierInput } from './inputs/create-supplier.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Supplier)
@UseGuards(JwtAuthGuard)
export class SuppliersResolver {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Mutation(() => Supplier)
  createSupplier(
    @Args('input') createSupplierInput: CreateSupplierInput,
    @CurrentUser() user: any
  ) {
    return this.suppliersService.createGraphQL(createSupplierInput, user.companyId);
  }

  @Query(() => [Supplier], { name: 'suppliers' })
  findAll(@CurrentUser() user: any) {
    return this.suppliersService.findAllGraphQL(user.companyId);
  }

  @Query(() => Supplier, { name: 'supplier' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any
  ) {
    return this.suppliersService.findOneGraphQL(id, user.companyId);
  }
}
