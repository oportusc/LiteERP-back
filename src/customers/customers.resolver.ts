import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { CreateCustomerInput } from './inputs/create-customer.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Customer)
@UseGuards(JwtAuthGuard)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Mutation(() => Customer)
  createCustomer(
    @Args('input') createCustomerInput: CreateCustomerInput,
    @CurrentUser() user: any
  ) {
    return this.customersService.createGraphQL(createCustomerInput, user.companyId);
  }

  @Query(() => [Customer], { name: 'customers' })
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAllGraphQL(user.companyId);
  }

  @Query(() => Customer, { name: 'customer' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any
  ) {
    return this.customersService.findOneGraphQL(id, user.companyId);
  }
}
