import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { Sale } from './entities/sale.entity';
import { CreateSaleInput } from './inputs/create-sale.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Sale)
@UseGuards(JwtAuthGuard)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Mutation(() => Sale)
  createSale(
    @Args('input') createSaleInput: CreateSaleInput,
    @CurrentUser() user: any
  ) {
    return this.salesService.createGraphQL(createSaleInput, user.companyId);
  }

  @Query(() => [Sale], { name: 'sales' })
  findAll(@CurrentUser() user: any) {
    return this.salesService.findAllGraphQL(user.companyId);
  }

  @Query(() => [Sale], { name: 'pendingPayments' })
  findPendingPayments(@CurrentUser() user: any) {
    return this.salesService.findPendingPayments(user.companyId);
  }

  @Query(() => [Sale], { name: 'salesByCustomer' })
  findByCustomer(
    @Args('customerId', { type: () => ID }) customerId: string,
    @CurrentUser() user: any
  ) {
    return this.salesService.findByCustomer(customerId, user.companyId);
  }

  @Query(() => Sale, { name: 'sale' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any
  ) {
    return this.salesService.findOneGraphQL(id, user.companyId);
  }

  @Mutation(() => Sale)
  addPayment(
    @Args('saleId', { type: () => ID }) saleId: string,
    @Args('amount', { type: () => Float }) amount: number,
    @CurrentUser() user: any
  ) {
    return this.salesService.addPayment(saleId, amount, user.companyId);
  }

  @Mutation(() => Sale)
  cancelSale(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any
  ) {
    return this.salesService.cancel(id, user.companyId);
  }
}
