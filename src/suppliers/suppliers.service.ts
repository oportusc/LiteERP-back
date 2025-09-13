import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierInput } from './inputs/create-supplier.input';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto, companyId: string): Promise<Supplier> {
    // Verificar si el nombre ya existe en la empresa
    const existingSupplier = await this.supplierModel.findOne({ 
      name: createSupplierDto.name, 
      companyId,
      isActive: true 
    });
    
    if (existingSupplier) {
      throw new ConflictException('Ya existe un proveedor con este nombre');
    }

    const supplierData = {
      ...createSupplierDto,
      companyId: new Types.ObjectId(companyId)
    };

    const supplier = new this.supplierModel(supplierData);
    return supplier.save();
  }

  async findAll(companyId: string): Promise<Supplier[]> {
    return this.supplierModel
      .find({ companyId, isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<Supplier> {
    const supplier = await this.supplierModel
      .findOne({ _id: id, companyId, isActive: true })
      .exec();

    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto, companyId: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findOne({ _id: id, companyId, isActive: true });
    
    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Verificar si el nuevo nombre ya existe (si se está cambiando)
    if (updateSupplierDto.name && updateSupplierDto.name !== supplier.name) {
      const existingSupplier = await this.supplierModel.findOne({ 
        name: updateSupplierDto.name, 
        companyId,
        isActive: true,
        _id: { $ne: id }
      });
      
      if (existingSupplier) {
        throw new ConflictException('Ya existe un proveedor con este nombre');
      }
    }

    const updatedSupplier = await this.supplierModel.findByIdAndUpdate(id, updateSupplierDto, { new: true }).exec();
    if (!updatedSupplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return updatedSupplier;
  }

  async delete(id: string, companyId: string): Promise<void> {
    const supplier = await this.supplierModel.findOne({ _id: id, companyId });
    
    if (!supplier) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    // Soft delete
    supplier.isActive = false;
    await supplier.save();
  }

  // Métodos para GraphQL
  async createGraphQL(input: CreateSupplierInput, companyId: string) {
    const createDto: CreateSupplierDto = {
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
