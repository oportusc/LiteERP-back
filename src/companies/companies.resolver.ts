import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CompaniesService } from './companies.service';
import { Company } from './entities/company.entity';
import { CreateCompanyInput } from './inputs/create-company.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Company)
@UseGuards(JwtAuthGuard)
export class CompaniesResolver {
  constructor(private companiesService: CompaniesService) {}

  @Mutation(() => Company)
  async createCompany(
    @Args('input') input: CreateCompanyInput,
    @CurrentUser() user: any,
  ): Promise<Company> {
    return this.companiesService.createGraphQL(input, user.userId);
  }

  @Query(() => [Company])
  async companies(): Promise<Company[]> {
    return this.companiesService.findAllGraphQL();
  }

  @Query(() => [Company])
  async myCompanies(@CurrentUser() user: any): Promise<Company[]> {
    return this.companiesService.getUserCompaniesGraphQL(user.userId);
  }

  @Query(() => [Company])
  async ownedCompanies(@CurrentUser() user: any): Promise<Company[]> {
    return this.companiesService.findByOwnerGraphQL(user.userId);
  }

  @Query(() => [Company])
  async memberships(@CurrentUser() user: any): Promise<Company[]> {
    return this.companiesService.findByMemberGraphQL(user.userId);
  }

  @Query(() => Company)
  async company(@Args('id', { type: () => ID }) id: string): Promise<Company> {
    return this.companiesService.findOneGraphQL(id);
  }
}
