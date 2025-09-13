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
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.create(createCompanyDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('my-companies')
  findMyCompanies(@Request() req) {
    return this.companiesService.getUserCompanies(req.user.userId);
  }

  @Get('owned')
  findOwnedCompanies(@Request() req) {
    return this.companiesService.findByOwner(req.user.userId);
  }

  @Get('memberships')
  findMemberships(@Request() req) {
    return this.companiesService.findByMember(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string, 
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req
  ) {
    return this.companiesService.update(id, updateCompanyDto, req.user.userId);
  }

  @Post(':id/leave')
  leaveCompany(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.companiesService.leaveCompany(id, req.user.userId);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('memberId', ParseObjectIdPipe) memberId: string,
    @Request() req
  ) {
    return this.companiesService.removeMember(id, memberId, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.companiesService.delete(id, req.user.userId);
  }
}
