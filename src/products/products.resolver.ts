import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './inputs/create-product.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CompanyId } from '../common/decorators/company-id.decorator';

@Resolver(() => Product)
@UseGuards(JwtAuthGuard)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product)
  createProduct(
    @Args('input') createProductInput: CreateProductInput,
    @CompanyId() companyId: string
  ) {
    return this.productsService.createGraphQL(createProductInput, companyId);
  }

  @Query(() => [Product], { name: 'products' })
  findAll(@CompanyId() companyId: string) {
    return this.productsService.findAllGraphQL(companyId);
  }

  @Query(() => [Product], { name: 'materiasPrimas' })
  findMateriasPrimas(@CompanyId() companyId: string) {
    return this.productsService.findMateriasPrimas(companyId);
  }

  @Query(() => [Product], { name: 'mixes' })
  findMixes(@CompanyId() companyId: string) {
    return this.productsService.findMixes(companyId);
  }

  @Query(() => Product, { name: 'product' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CompanyId() companyId: string
  ) {
    return this.productsService.findOneGraphQL(id, companyId);
  }
}
