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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto, @Request() req) {
    return this.salesService.create(createSaleDto, req.user.companyId);
  }

  @Get()
  findAll(@Request() req) {
    return this.salesService.findAll(req.user.companyId);
  }

  @Get('pending-payments')
  findPendingPayments(@Request() req) {
    return this.salesService.findPendingPayments(req.user.companyId);
  }

  @Get('stats')
  getSalesStats(@Request() req) {
    return this.salesService.getSalesStats(req.user.companyId);
  }

  @Get('by-customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string, @Request() req) {
    return this.salesService.findByCustomer(customerId, req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.salesService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateSaleDto: UpdateSaleDto, 
    @Request() req
  ) {
    return this.salesService.update(id, updateSaleDto, req.user.companyId);
  }

  @Patch(':id/add-payment')
  addPayment(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Request() req
  ) {
    return this.salesService.addPayment(id, amount, req.user.companyId);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.salesService.cancel(id, req.user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.salesService.delete(id, req.user.companyId);
  }
}
