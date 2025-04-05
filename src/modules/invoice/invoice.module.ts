import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { EnergyData } from './entities/energyData.entity';
import { HistoryEnergy } from './entities/historyEnergy.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, EnergyData, HistoryEnergy]),UserModule],

  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
