import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sale, SaleDocument } from './schemas/sale.schema';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CreateSaleInput } from './inputs/create-sale.input';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name) private saleModel: Model<SaleDocument>,
    @Inject(forwardRef(() => ProductsService))
    private productsService: ProductsService,
    private customersService: CustomersService,
  ) {}

  async create(createSaleDto: CreateSaleDto, companyId: string): Promise<Sale> {
    // Validar que el cliente exista
    await this.customersService.findOne(createSaleDto.customerId, companyId);

    // Validar y actualizar stock de productos
    await this.validateAndUpdateStock(createSaleDto.items, companyId, 'decrease');

    // Calcular montos
    const paidAmount = createSaleDto.paidAmount || 0;
    const calculatedPendingAmount = createSaleDto.total - paidAmount;
    
    // Determinar status de pago automáticamente
    let paymentStatus = 'pending';
    if (paidAmount >= createSaleDto.total) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      paymentStatus = 'partial';
    }

    const saleData = {
      ...createSaleDto,
      customerId: new Types.ObjectId(createSaleDto.customerId),
      companyId: new Types.ObjectId(companyId),
      items: createSaleDto.items.map(item => ({
        ...item,
        productId: new Types.ObjectId(item.productId)
      })),
      pendingAmount: calculatedPendingAmount,
      paymentStatus: createSaleDto.paymentStatus || paymentStatus,
      isPaid: paymentStatus === 'paid'
    };

    const sale = new this.saleModel(saleData);
    return sale.save();
  }

  async findAll(companyId: string): Promise<Sale[]> {
    return this.saleModel
      .find({ companyId, isActive: true })
      .populate('customerId', 'name email')
      .populate('items.productId', 'name unitOfMeasure')
      .sort({ saleDate: -1 })
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<Sale> {
    const sale = await this.saleModel
      .findOne({ _id: id, companyId, isActive: true })
      .populate('customerId', 'name email phone address')
      .populate('items.productId', 'name unitOfMeasure esMix')
      .exec();

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
  }

  async findPendingPayments(companyId: string): Promise<Sale[]> {
    return this.saleModel
      .find({ 
        companyId, 
        isActive: true, 
        paymentStatus: { $in: ['pending', 'partial'] }
      })
      .populate('customerId', 'name email')
      .sort({ saleDate: -1 })
      .exec();
  }

  async findByCustomer(customerId: string, companyId: string): Promise<Sale[]> {
    return this.saleModel
      .find({ customerId, companyId, isActive: true })
      .populate('items.productId', 'name unitOfMeasure')
      .sort({ saleDate: -1 })
      .exec();
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, companyId: string): Promise<Sale> {
    const sale = await this.saleModel.findOne({ _id: id, companyId, isActive: true });
    
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    // Si se está actualizando los items, revertir stock anterior y aplicar nuevo
    if (updateSaleDto.items) {
      // Revertir stock de la venta original
      await this.validateAndUpdateStock(sale.items, companyId, 'increase');
      
      // Aplicar nuevo stock
      await this.validateAndUpdateStock(updateSaleDto.items, companyId, 'decrease');
    }

    // Recalcular montos si es necesario
    if (updateSaleDto.total !== undefined || updateSaleDto.paidAmount !== undefined) {
      const newTotal = updateSaleDto.total || sale.total;
      const newPaidAmount = updateSaleDto.paidAmount || sale.paidAmount;
      const newPendingAmount = newTotal - newPaidAmount;
      
      // Determinar nuevo status de pago
      let newPaymentStatus = sale.paymentStatus;
      if (newPaidAmount >= newTotal) {
        newPaymentStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newPaymentStatus = 'partial';
      } else {
        newPaymentStatus = 'pending';
      }
      
      updateSaleDto.pendingAmount = newPendingAmount;
      updateSaleDto.paymentStatus = newPaymentStatus;
      updateSaleDto.isPaid = newPaymentStatus === 'paid';
    }

    const updateData = {
      ...updateSaleDto,
      customerId: updateSaleDto.customerId ? new Types.ObjectId(updateSaleDto.customerId) : undefined,
      items: updateSaleDto.items?.map(item => ({
        ...item,
        productId: new Types.ObjectId(item.productId)
      }))
    };

    const updatedSale = await this.saleModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedSale) {
      throw new NotFoundException('Venta no encontrada');
    }
    return updatedSale;
  }

  async addPayment(id: string, paymentAmount: number, companyId: string): Promise<Sale> {
    const sale = await this.saleModel.findOne({ _id: id, companyId, isActive: true });
    
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (paymentAmount <= 0) {
      throw new BadRequestException('El monto del pago debe ser mayor a 0');
    }

    const newPaidAmount = sale.paidAmount + paymentAmount;
    const newPendingAmount = sale.total - newPaidAmount;

    if (newPaidAmount > sale.total) {
      throw new BadRequestException('El pago excede el total de la venta');
    }

    // Determinar nuevo status
    let newPaymentStatus = 'partial';
    if (newPaidAmount >= sale.total) {
      newPaymentStatus = 'paid';
    }

    sale.paidAmount = newPaidAmount;
    sale.pendingAmount = newPendingAmount;
    sale.paymentStatus = newPaymentStatus;
    sale.isPaid = newPaymentStatus === 'paid';
    
    if (newPaymentStatus === 'paid' && !sale.paymentDate) {
      sale.paymentDate = new Date();
    }

    return sale.save();
  }

  async cancel(id: string, companyId: string): Promise<Sale> {
    const sale = await this.saleModel.findOne({ _id: id, companyId, isActive: true });
    
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    if (sale.paymentStatus === 'paid') {
      throw new BadRequestException('No se puede cancelar una venta que ya está pagada');
    }

    // Revertir stock
    await this.validateAndUpdateStock(sale.items, companyId, 'increase');

    sale.paymentStatus = 'cancelled';
    sale.isActive = false;

    return sale.save();
  }

  async delete(id: string, companyId: string): Promise<void> {
    const sale = await this.saleModel.findOne({ _id: id, companyId });
    
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    // Revertir stock si la venta estaba activa
    if (sale.isActive) {
      await this.validateAndUpdateStock(sale.items, companyId, 'increase');
    }

    sale.isActive = false;
    await sale.save();
  }

  // Método auxiliar para validar y actualizar stock
  private async validateAndUpdateStock(items: any[], companyId: string, operation: 'increase' | 'decrease'): Promise<void> {
    for (const item of items) {
      const product = await this.productsService.findOne(item.productId.toString(), companyId);
      
      if (product.esMix) {
        // Para productos mix, actualizar las materias primas
        if (product.receta) {
          for (const ingrediente of product.receta) {
            const cantidadNecesaria = ingrediente.cantidad * item.quantity;
            const materiaPrima = await this.productsService.findOne(ingrediente.productId.toString(), companyId);
            
            let newStock: number;
            if (operation === 'decrease') {
              if (materiaPrima.currentStock < cantidadNecesaria) {
                throw new BadRequestException(`Stock insuficiente de ${materiaPrima.name}`);
              }
              newStock = materiaPrima.currentStock - cantidadNecesaria;
            } else {
              newStock = materiaPrima.currentStock + cantidadNecesaria;
            }
            
            await this.productsService.updateStock(ingrediente.productId.toString(), newStock, companyId);
          }
        }
      } else {
        // Para productos simples
        let newStock: number;
        if (operation === 'decrease') {
          if (product.currentStock < item.quantity) {
            throw new BadRequestException(`Stock insuficiente de ${product.name}`);
          }
          newStock = product.currentStock - item.quantity;
        } else {
          newStock = product.currentStock + item.quantity;
        }
        
        await this.productsService.updateStock(item.productId.toString(), newStock, companyId);
      }
    }
  }

  // Métodos para estadísticas
  async getSalesStats(companyId: string): Promise<any> {
    const totalSales = await this.saleModel.countDocuments({ companyId, isActive: true });
    const totalRevenue = await this.saleModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), isActive: true } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const pendingAmount = await this.saleModel.aggregate([
      { $match: { companyId: new Types.ObjectId(companyId), isActive: true, paymentStatus: { $in: ['pending', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$pendingAmount' } } }
    ]);

    return {
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0
    };
  }

  // Métodos para GraphQL
  async createGraphQL(input: CreateSaleInput, companyId: string) {
    const createDto: CreateSaleDto = {
      customerId: input.customerId,
      saleDate: input.saleDate,
      items: input.items,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      isPaid: input.isPaid,
      paidAmount: input.paidAmount,
      paymentDate: input.paymentDate,
      notes: input.notes,
      paymentStatus: input.paymentStatus
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
