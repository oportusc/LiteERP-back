import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.companyId);
  }

  @Get()
  findAll(@Request() req) {
    return this.productsService.findAll(req.user.companyId);
  }

  @Get('materias-primas')
  findMateriasPrimas(@Request() req) {
    return this.productsService.findMateriasPrimas(req.user.companyId);
  }

  @Get('mixes')
  findMixes(@Request() req) {
    return this.productsService.findMixes(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.productsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateProductDto: UpdateProductDto, 
    @Request() req
  ) {
    return this.productsService.update(id, updateProductDto, req.user.companyId);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string, 
    @Body('stock') stock: number, 
    @Request() req
  ) {
    return this.productsService.updateStock(id, stock, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.delete(id, req.user.companyId);
  }
}
