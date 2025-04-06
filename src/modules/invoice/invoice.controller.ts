import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, Res, NotFoundException, StreamableFile, } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'nest-keycloak-connect';
import { PaginationInvoiceRequest } from './dto/request/findall-invoice.dto';
import { InvoiceResponseDTO } from './dto/response/invoice.response.dto';
import { Response } from 'express';
import { Readable } from 'stream';

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

  @Get('download/:id')
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const fileStream = await this.invoiceService.dowloadFile(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice.pdf"`);

      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.status(404).send(error.message);
      }
      console.error('Erro ao baixar PDF:', error);
      return res.status(500).send('Erro ao baixar o arquivo.');
    }
  }
}
