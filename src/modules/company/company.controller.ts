import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/request/create-company.dto';
import { UpdateCompanyDto } from './dto/request/update-company.dto';
import { PaginationCompanyRequest } from './dto/request/findall-company.dto';
import { CompanyResponseDTO } from './dto/response/company.response.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get() 
  findAll(@Query() query: PaginationCompanyRequest):Promise<CompanyResponseDTO> {
    return this.companyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }

  @Patch(':companyId/add/:userId')
  addUserToCompany(@Param('companyId') companyId: string, @Param('userId') userId: string) {
    return this.companyService.addUserToCompany(companyId, userId);
  }

  @Patch(':companyId/remove/:userId')
  removeUserFromCompany(@Param('companyId') companyId: string, @Param('userId') userId: string) {
    return this.companyService.removeUserFromCompany(companyId, userId);
  }
}
