import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductInput } from './inputs/create-product.input';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto, companyId: string): Promise<Product> {
    // Verificar si el nombre ya existe en la empresa
    const existingProduct = await this.productModel.findOne({ 
      name: createProductDto.name, 
      companyId,
      isActive: true 
    });
    
    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este nombre');
    }

    // Si es un mix, validar que todas las materias primas existan
    if (createProductDto.esMix && createProductDto.receta) {
      await this.validateRecipe(createProductDto.receta, companyId);
    }

    // Calcular campos de rentabilidad automáticamente para productos simples
    let calculatedCostPerSaleUnit: number | undefined;
    let calculatedProfitMargin: number | undefined;
    let calculatedProfitPercentage: number | undefined;
    
    if (!createProductDto.esMix && createProductDto.purchaseQuantity && createProductDto.purchasePrice && createProductDto.saleQuantity && createProductDto.salePrice) {
      // Calcular costo por gramo (siempre 1kg = 1000g de compra)
      const costPerGram = createProductDto.purchasePrice / 1000; // Siempre compramos 1kg
      
      // Calcular costo por unidad de venta
      calculatedCostPerSaleUnit = costPerGram * createProductDto.saleQuantity;
      
      // Calcular margen de ganancia
      calculatedProfitMargin = createProductDto.salePrice - calculatedCostPerSaleUnit;
      
      // Calcular porcentaje de ganancia
      calculatedProfitPercentage = createProductDto.salePrice > 0 ? (calculatedProfitMargin / createProductDto.salePrice) * 100 : 0;
      calculatedProfitPercentage = Math.round(calculatedProfitPercentage);
    }

    const productData = {
      ...createProductDto,
      costPerSaleUnit: calculatedCostPerSaleUnit,
      profitMargin: calculatedProfitMargin,
      profitPercentage: calculatedProfitPercentage,
      companyId: new Types.ObjectId(companyId),
      supplierId: createProductDto.supplierId ? new Types.ObjectId(createProductDto.supplierId) : undefined,
      receta: createProductDto.receta?.map(r => ({
        ...r,
        productId: new Types.ObjectId(r.productId)
      }))
    };

    const product = new this.productModel(productData);
    return product.save();
  }

  async findAll(companyId: string): Promise<Product[]> {
    // Convertir companyId a ObjectId para la consulta
    const companyObjectId = new Types.ObjectId(companyId);
    
    const products = await this.productModel
      .find({ companyId: companyObjectId, isActive: true })
      .populate('supplierId', 'name')
      .exec();

    // Calcular costos y stock para productos mix
    const result = await Promise.all(products.map(async (product) => {
      if (product.esMix) {
        const calculatedCost = await this.calculateMixCost(product);
        const availableStock = await this.calculateMixStock(product);
        const profitabilityData = this.calculateProfitability(product);
        return {
          ...product.toObject(),
          id: (product._id as Types.ObjectId).toString(), // Mapear _id a id para GraphQL
          calculatedCost,
          availableStock,
          ...profitabilityData
        } as any;
      }
      const profitabilityData = this.calculateProfitability(product);
      return {
        ...product.toObject(),
        id: (product._id as Types.ObjectId).toString(), // Mapear _id a id para GraphQL
        availableStock: product.currentStock,
        ...profitabilityData
      } as any;
    }));
    
    return result;
  }

  async findOne(id: string, companyId: string): Promise<Product> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    const product = await this.productModel
      .findOne({ _id: id, companyId: companyObjectId, isActive: true })
      .populate('supplierId', 'name')
      .populate('receta.productId', 'name unitOfMeasure')
      .exec();

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    const profitabilityData = this.calculateProfitability(product);
    
    // Si es mix, calcular costos y stock
    if (product.esMix) {
      const calculatedCost = await this.calculateMixCost(product);
      const availableStock = await this.calculateMixStock(product);
      return {
        ...product.toObject(),
        id: (product._id as Types.ObjectId).toString(), // Mapear _id a id para GraphQL
        calculatedCost,
        availableStock,
        ...profitabilityData
      } as any;
    }

    return {
      ...product.toObject(),
      id: (product._id as Types.ObjectId).toString(), // Mapear _id a id para GraphQL
      availableStock: product.currentStock,
      ...profitabilityData
    } as any;
  }

  async findMateriasPrimas(companyId: string): Promise<Product[]> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    return this.productModel
      .find({ 
        companyId: companyObjectId, 
        isActive: true, 
        esMix: { $ne: true } 
      })
      .populate('supplierId', 'name')
      .exec();
  }

  async findMixes(companyId: string): Promise<Product[]> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    const products = await this.productModel
      .find({ 
        companyId: companyObjectId, 
        isActive: true, 
        esMix: true 
      })
      .populate('receta.productId', 'name unitOfMeasure currentStock costPerUnit')
      .exec();

    return Promise.all(products.map(async (product) => {
      const calculatedCost = await this.calculateMixCost(product);
      const availableStock = await this.calculateMixStock(product);
      const profitabilityData = this.calculateProfitability(product);
      return {
        ...product.toObject(),
        id: (product._id as Types.ObjectId).toString(), // Mapear _id a id para GraphQL
        calculatedCost,
        availableStock,
        ...profitabilityData
      } as any;
    }));
  }

  async update(id: string, updateProductDto: UpdateProductDto, companyId: string): Promise<Product> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    const product = await this.productModel.findOne({ _id: id, companyId: companyObjectId, isActive: true });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Si se está actualizando la receta, validarla
    if (updateProductDto.receta) {
      await this.validateRecipe(updateProductDto.receta, companyId);
    }

    // Los productos mix no permiten cambio de campos de costo manual
    if (product.esMix && (updateProductDto.purchasePrice || updateProductDto.salePrice)) {
      throw new BadRequestException('No se puede cambiar información comercial en productos mix');
    }

    const updateData = {
      ...updateProductDto,
      supplierId: updateProductDto.supplierId ? new Types.ObjectId(updateProductDto.supplierId) : undefined,
      receta: updateProductDto.receta?.map(r => ({
        ...r,
        productId: new Types.ObjectId(r.productId)
      }))
    };

    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedProduct) {
      throw new NotFoundException('Producto no encontrado');
    }
    return updatedProduct;
  }

  async updateStock(id: string, newStock: number, companyId: string): Promise<Product> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    const product = await this.productModel.findOne({ _id: id, companyId: companyObjectId, isActive: true });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.esMix) {
      throw new BadRequestException('No se puede actualizar el stock directamente en productos mix');
    }

    product.currentStock = newStock;
    return product.save();
  }

  async delete(id: string, companyId: string): Promise<void> {
    const companyObjectId = new Types.ObjectId(companyId);
    
    const product = await this.productModel.findOne({ _id: id, companyId: companyObjectId });
    
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si está siendo usado en algún mix
    const usedInMix = await this.productModel.findOne({
      companyId: companyObjectId,
      isActive: true,
      esMix: true,
      'receta.productId': id
    });

    if (usedInMix) {
      throw new BadRequestException('No se puede eliminar el producto porque está siendo usado en un mix');
    }

    product.isActive = false;
    await product.save();
  }

  // Métodos de cálculo
  private async calculateMixCost(product: ProductDocument): Promise<number> {
    if (!product.esMix || !product.receta) return 0;

    let costoTotal = 0;

    for (const ingrediente of product.receta) {
      const materiaPrima = await this.productModel.findById(ingrediente.productId);
      if (!materiaPrima || !materiaPrima.costPerSaleUnit) continue;

      // Calcular costo por gramo basado en costPerSaleUnit
      const costPerGram = materiaPrima.costPerSaleUnit / (materiaPrima.saleQuantity || 1);
      
      // Convertir la cantidad del ingrediente a gramos
      const cantidadEnGramos = this.convertirUnidades(
        ingrediente.cantidad,
        ingrediente.unidad,
        'gr'
      );

      costoTotal += costPerGram * cantidadEnGramos;
    }

    return Math.round(costoTotal * 100) / 100; // Redondear a 2 decimales
  }

  private async calculateMixStock(product: ProductDocument): Promise<number> {
    if (!product.esMix || !product.receta) return 0;

    let minimoUnidades = Infinity;

    for (const ingrediente of product.receta) {
      const materiaPrima = await this.productModel.findById(ingrediente.productId);
      if (!materiaPrima) return 0;

      // Convertir stock a la unidad del ingrediente
      // Usamos saleUnit como unidad de referencia, o 'gr' por defecto
      const unidadReferencia = materiaPrima.saleUnit || 'gr';
      const stockConvertido = this.convertirUnidades(
        materiaPrima.currentStock,
        unidadReferencia,
        ingrediente.unidad
      );

      const unidadesPosibles = Math.floor(stockConvertido / ingrediente.cantidad);
      minimoUnidades = Math.min(minimoUnidades, unidadesPosibles);
    }

    return minimoUnidades === Infinity ? 0 : minimoUnidades;
  }

  private convertirUnidades(valor: number, unidadOrigen: string, unidadDestino: string): number {
    if (unidadOrigen === unidadDestino) return valor;

    // Convertir todo a gramos primero
    const factoresAGramos = {
      'g': 1,
      'gr': 1,
      'kg': 1000,
      'lb': 453.592,
      'oz': 28.3495
    };

    const valorEnGramos = valor * factoresAGramos[unidadOrigen];
    return valorEnGramos / factoresAGramos[unidadDestino];
  }

  private async validateRecipe(receta: any[], companyId: string): Promise<void> {
    for (const ingrediente of receta) {
      const materiaPrima = await this.productModel.findOne({
        _id: ingrediente.productId,
        companyId,
        isActive: true,
        esMix: { $ne: true } // Solo materias primas, no mixes
      });

      if (!materiaPrima) {
        throw new BadRequestException(`La materia prima ${ingrediente.productId} no existe o no es válida`);
      }
    }
  }

  // Métodos para GraphQL
  async createGraphQL(input: CreateProductInput, companyId: string) {
    const createDto: CreateProductDto = {
      name: input.name,
      description: input.description,
      currentStock: input.currentStock,
      supplierId: input.supplierId,
      // Campos comerciales
      purchaseQuantity: input.purchaseQuantity,
      purchaseUnit: input.purchaseUnit,
      purchasePrice: input.purchasePrice,
      saleQuantity: input.saleQuantity,
      saleUnit: input.saleUnit,
      salePrice: input.salePrice,
      esMix: input.esMix,
      receta: input.receta
    };

    return this.create(createDto, companyId);
  }

  async findAllGraphQL(companyId: string) {
    return this.findAll(companyId);
  }

  async findOneGraphQL(id: string, companyId: string) {
    return this.findOne(id, companyId);
  }

  // Método para calcular rentabilidad
  private calculateProfitability(product: ProductDocument): {
    costPerSaleUnit?: number;
    profitMargin?: number;
    profitPercentage?: number;
  } {
    // Solo calcular para productos simples con información completa de compra/venta
    if (product.esMix || 
        !product.purchaseQuantity || 
        !product.purchasePrice || 
        !product.saleQuantity || 
        !product.salePrice) {
      return {};
    }

    try {
      // Convertir todo a la misma unidad base (gramos)
      const purchaseQuantityInGrams = this.convertirUnidades(
        product.purchaseQuantity,
        product.purchaseUnit,
        'g'
      );

      const saleQuantityInGrams = this.convertirUnidades(
        product.saleQuantity,
        product.saleUnit,
        'g'
      );

      // Calcular costo por gramo
      const costPerGram = product.purchasePrice / purchaseQuantityInGrams;
      
      // Calcular costo por unidad de venta
      const costPerSaleUnit = costPerGram * saleQuantityInGrams;
      
      // Calcular margen de ganancia
      const profitMargin = product.salePrice - costPerSaleUnit;
      
      // Margen de ganancia real: (utilidad / precio de venta) × 100
      const profitPercentage = product.salePrice > 0 ? (profitMargin / product.salePrice) * 100 : 0;

      return {
        costPerSaleUnit: Math.round(costPerSaleUnit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        profitPercentage: Math.round(profitPercentage) // Redondear al entero más cercano
      };
    } catch (error) {
      console.error('Error calculating profitability:', error);
      return {};
    }
  }
}
