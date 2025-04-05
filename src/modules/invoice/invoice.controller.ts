import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'nest-keycloak-connect';
import { PaginationInvoiceRequest } from './dto/request/findall-invoice.dto';
import { InvoiceResponseDTO } from './dto/response/invoice.response.dto';

@Public()
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}


  @Get()
  findAll(@Query() query: PaginationInvoiceRequest):Promise<InvoiceResponseDTO> {
    return this.invoiceService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(id);
  }

  @Post('upload/:companyId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File,@Param('companyId') companyId: string) {

    return this.invoiceService.uploadFile(file,companyId);
  }
}
