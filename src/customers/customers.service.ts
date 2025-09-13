import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerInput } from './inputs/create-customer.input';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto, companyId: string): Promise<Customer> {
    // Verificar si el nombre ya existe en la empresa
    const existingCustomer = await this.customerModel.findOne({ 
      name: createCustomerDto.name, 
      companyId,
      isActive: true 
    });
    
    if (existingCustomer) {
      throw new ConflictException('Ya existe un cliente con este nombre');
    }

    const customerData = {
      ...createCustomerDto,
      companyId: new Types.ObjectId(companyId)
    };

    const customer = new this.customerModel(customerData);
    return customer.save();
  }

  async findAll(companyId: string): Promise<Customer[]> {
    return this.customerModel
      .find({ companyId, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<Customer> {
    const customer = await this.customerModel
      .findOne({ _id: id, companyId, isActive: true })
      .exec();

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, companyId: string): Promise<Customer> {
    const customer = await this.customerModel.findOne({ _id: id, companyId, isActive: true });
    
    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (updateCustomerDto.name && updateCustomerDto.name !== customer.name) {
      const existingCustomer = await this.customerModel.findOne({ 
        name: updateCustomerDto.name, 
        companyId,
        isActive: true,
        _id: { $ne: id }
      });
      
      if (existingCustomer) {
        throw new ConflictException('Ya existe un cliente con este nombre');
      }
    }

    const updatedCustomer = await this.customerModel.findByIdAndUpdate(id, updateCustomerDto, { new: true }).exec();
    if (!updatedCustomer) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return updatedCustomer;
  }

  async delete(id: string, companyId: string): Promise<void> {
    const customer = await this.customerModel.findOne({ _id: id, companyId });
    
    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Soft delete
    customer.isActive = false;
    await customer.save();
  }

  // Métodos para GraphQL
  async createGraphQL(input: CreateCustomerInput, companyId: string) {
    const createDto: CreateCustomerDto = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      contactPerson: input.contactPerson,
      notes: input.notes
    };

    return this.create(createDto, companyId);
  }

  async findAllGraphQL(companyId: string) {
    return this.findAll(companyId);
  }

  async findOneGraphQL(id: string, companyId: string) {
    return this.findOne(id, companyId);
  }
}
