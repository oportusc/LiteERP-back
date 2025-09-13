import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateCompanyInput } from './inputs/create-company.input';
import { UsersService } from '../users/users.service';
import { mapCompanyToGraphQL } from '../common/mappers/company.mapper';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    private usersService: UsersService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, ownerId: string): Promise<Company> {
    
    // Verificar si el nombre ya existe
    const existingCompany = await this.companyModel.findOne({ name: createCompanyDto.name });
    if (existingCompany) {
      throw new ConflictException('El nombre de la empresa ya existe');
    }

    const companyData = {
      ...createCompanyDto,
      owner: ownerId,
      members: [ownerId], // El propietario es automáticamente miembro
    };
    

    const company = new this.companyModel(companyData);
    const savedCompany = await company.save();
    
    
    // Actualizar el usuario agregando la empresa a su lista
    await this.usersService.addCompany(ownerId, (savedCompany._id as any).toString());
    
    return savedCompany;
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find({ isActive: true }).populate('owner', 'name email role').populate('members', 'name email role').exec();
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).populate('owner', 'name email role').populate('members', 'name email role').exec();
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return company;
  }

  async findByOwner(ownerId: string): Promise<Company[]> {
    return this.companyModel.find({ owner: ownerId, isActive: true }).populate('owner', 'name email role').populate('members', 'name email role').exec();
  }

  async findByMember(userId: string): Promise<Company[]> {
    return this.companyModel.find({ members: userId, isActive: true }).populate('owner', 'name email role').populate('members', 'name email role').exec();
  }

  async getUserCompanies(userId: string): Promise<Company[]> {
    // Obtener todas las empresas donde el usuario es propietario o miembro
    const ownedCompanies = await this.companyModel.find({ owner: userId, isActive: true }).populate('owner', 'name email role').populate('members', 'name email role').exec();
    const memberCompanies = await this.companyModel.find({ members: userId, owner: { $ne: userId }, isActive: true }).populate('owner', 'name email role').populate('members', 'name email role').exec();
    
    return [...ownedCompanies, ...memberCompanies];
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, userId: string): Promise<Company> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Solo el propietario puede actualizar la empresa
    if (company.owner.toString() !== userId) {
      throw new ForbiddenException('Solo el propietario puede actualizar la empresa');
    }

    Object.assign(company, updateCompanyDto);
    return company.save();
  }


  async leaveCompany(companyId: string, userId: string): Promise<void> {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // El propietario no puede dejar la empresa
    if (company.owner.toString() === userId) {
      throw new BadRequestException('El propietario no puede dejar la empresa');
    }

    // Verificar si el usuario es miembro
    if (!company.members.includes(userId)) {
      throw new BadRequestException('No eres miembro de esta empresa');
    }

    // Remover usuario de la empresa
    company.members = company.members.filter(memberId => memberId.toString() !== userId);
    await company.save();
    
    // Actualizar el usuario removiendo la empresa de su lista
    await this.usersService.removeCompany(userId, companyId);
  }

  async removeMember(companyId: string, memberId: string, ownerId: string): Promise<Company> {
    const company = await this.companyModel.findById(companyId);
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Solo el propietario puede remover miembros
    if (company.owner.toString() !== ownerId) {
      throw new ForbiddenException('Solo el propietario puede remover miembros');
    }

    // No se puede remover al propietario
    if (memberId === ownerId) {
      throw new BadRequestException('No puedes remover al propietario');
    }

    // Verificar si el miembro existe
    if (!company.members.includes(memberId)) {
      throw new BadRequestException('El usuario no es miembro de esta empresa');
    }

    // Remover miembro
    company.members = company.members.filter(id => id.toString() !== memberId);
    const savedCompany = await company.save();
    
    // Actualizar el usuario removiendo la empresa de su lista
    await this.usersService.removeCompany(memberId, companyId);
    
    return savedCompany;
  }

  async delete(id: string, userId: string): Promise<void> {
    const company = await this.companyModel.findById(id);
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }

    // Solo el propietario puede eliminar la empresa
    if (company.owner.toString() !== userId) {
      throw new ForbiddenException('Solo el propietario puede eliminar la empresa');
    }

    // En lugar de eliminar, desactivamos la empresa
    company.isActive = false;
    await company.save();
  }

  // Métodos para GraphQL
  async createGraphQL(input: CreateCompanyInput, ownerId: string) {

    const createCompanyDto: CreateCompanyDto = {
      name: input.name,
      maxMembers: input.maxMembers || 0,
    };

    const createdCompany = await this.create(createCompanyDto, ownerId);
    
    // Hacer populate del company creado
    const populatedCompany = await this.companyModel
      .findById((createdCompany as any)._id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    
    return mapCompanyToGraphQL(populatedCompany);
  }

  async findAllGraphQL() {
    const companies = await this.companyModel
      .find({ isActive: true })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    return companies.map(company => mapCompanyToGraphQL(company));
  }

  async getUserCompaniesGraphQL(userId: string) {
    const companies = await this.companyModel
      .find({ 
        $or: [
          { owner: userId },
          { members: userId }
        ],
        isActive: true 
      })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    return companies.map(company => mapCompanyToGraphQL(company));
  }

  async findByOwnerGraphQL(ownerId: string) {
    const companies = await this.companyModel
      .find({ owner: ownerId, isActive: true })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    return companies.map(company => mapCompanyToGraphQL(company));
  }

  async findByMemberGraphQL(memberId: string) {
    const companies = await this.companyModel
      .find({ members: memberId, isActive: true })
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    return companies.map(company => mapCompanyToGraphQL(company));
  }

  async findOneGraphQL(id: string) {
    const company = await this.companyModel
      .findById(id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role')
      .exec();
    
    if (!company) {
      throw new NotFoundException('Empresa no encontrada');
    }
    
    return mapCompanyToGraphQL(company);
  }
}
