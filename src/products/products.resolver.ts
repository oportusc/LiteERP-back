import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './inputs/create-product.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Product)
@UseGuards(JwtAuthGuard)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  createProduct(
    @Args('input') createProductInput: CreateProductInput,
    @CurrentUser() user: any
  ) {
    return this.productsService.createGraphQL(createProductInput, user.companyId);
  }

  @Query(() => [Product], { name: 'products' })
  findAll(@CurrentUser() user: any) {
    return this.productsService.findAllGraphQL(user.companyId);
  }

  @Query(() => [Product], { name: 'materiasPrimas' })
  findMateriasPrimas(@CurrentUser() user: any) {
    return this.productsService.findMateriasPrimas(user.companyId);
  }

  @Query(() => [Product], { name: 'mixes' })
  findMixes(@CurrentUser() user: any) {
    return this.productsService.findMixes(user.companyId);
  }

  @Query(() => Product, { name: 'product' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any
  ) {
    return this.productsService.findOneGraphQL(id, user.companyId);
  }
}
