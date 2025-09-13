import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './inputs/login.input';
import { RegisterInput } from './inputs/register.input';
import { AuthResponse } from './entities/auth-response.entity';
import { User } from '../users/entities/user.entity';
import { UserWithCompanies } from './entities/user-with-companies.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return this.authService.registerGraphQL(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.loginGraphQL(input);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<User> {
    return this.authService.getUserProfileGraphQL(user.userId);
  }

  @Query(() => UserWithCompanies)
  @UseGuards(JwtAuthGuard)
  async meWithCompanies(@CurrentUser() user: any): Promise<UserWithCompanies> {
    return this.authService.getUserWithCompaniesGraphQL(user.userId);
  }
}
