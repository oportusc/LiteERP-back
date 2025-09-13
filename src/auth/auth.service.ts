import { Injectable, UnauthorizedException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterInput } from './inputs/register.input';
import { LoginInput } from './inputs/login.input';
import { mapUserToGraphQL } from '../common/mappers/user.mapper';
import { mapCompanyToGraphQL } from '../common/mappers/company.mapper';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => CompaniesService))
    private companiesService: CompaniesService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usersService.create(registerDto);
    const payload = { email: user.email, sub: (user as any)._id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companies: user.companies || [],
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: (user as any)._id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companies: user.companies || [],
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(password, user.password)) {
      const userObj = (user as any).toObject ? (user as any).toObject() : user;
      const { password: _, ...result } = userObj;
      return result;
    }
    return null;
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    return {
      id: (user as any)._id,
      email: user.email,
      name: user.name,
      role: user.role,
      companies: user.companies || [],
    };
  }

  // Métodos para GraphQL
  async registerGraphQL(input: RegisterInput) {
    const existingUser = await this.usersService.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usersService.create({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    const payload = { email: user.email, sub: (user as any)._id.toString(), userId: (user as any)._id.toString() };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: mapUserToGraphQL(user),
    };
  }

  async loginGraphQL(input: LoginInput) {
    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      input.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: (user as any)._id.toString(), userId: (user as any)._id.toString() };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: mapUserToGraphQL(user),
    };
  }

  async getUserProfileGraphQL(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return mapUserToGraphQL(user);
  }

  async getUserWithCompaniesGraphQL(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const userGraphQL = mapUserToGraphQL(user);

    // Si el usuario no tiene empresas, retornar sin companies
    if (!user.companies || user.companies.length === 0) {
      return {
        ...userGraphQL,
        companiesDetails: [],
      };
    }

    try {
      // Obtener las empresas completas del usuario
      const companiesDetails = await Promise.all(
        user.companies.map(async (companyId) => {
          try {
            const company = await this.companiesService.findOne(companyId);
            return company ? mapCompanyToGraphQL(company) : null;
          } catch (error) {
            console.error(`Error loading company ${companyId}:`, error);
            return null;
          }
        })
      );

      // Filtrar empresas nulas (en caso de errores)
      const validCompanies = companiesDetails.filter(company => company !== null);

      return {
        ...userGraphQL,
        companiesDetails: validCompanies,
      };
    } catch (error) {
      console.error('Error loading user companies:', error);
      return {
        ...userGraphQL,
        companiesDetails: [],
      };
    }
  }
}
