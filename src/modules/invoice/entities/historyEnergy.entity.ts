import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity()
export class HistoryEnergy {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column('uuid')
  invoice_id: string;

  @OneToOne(() => Invoice, (invoice) => invoice.historyEnergy)
  @JoinColumn({ name: 'invoice_id' })
  @ApiProperty({ type: () => Invoice })
  invoice: Invoice;

  @Column('jsonb')
  @ApiProperty({
    example: [
      { month: 'JAN', year: '24', consumption: '506' },
      { month: 'DEZ', year: '23', consumption: '606' },
      { month: 'NOV', year: '23', consumption: '481' },
      { month: 'OUT', year: '23', consumption: '517' },
      { month: 'SET', year: '23', consumption: '493' },
      { month: 'AGO', year: '23', consumption: '455' },
      { month: 'JUL', year: '23', consumption: '419' },
      { month: 'JUN', year: '23', consumption: '509' },
      { month: 'MAI', year: '23', consumption: '522' },
      { month: 'ABR', year: '23', consumption: '274' },
      { month: 'MAR', year: '23', consumption: '571' },
      { month: 'FEV', year: '23', consumption: '472' },
      { month: 'JAN', year: '23', consumption: '509' },
    ],
  })
  consumptionHistory: { month: string; year: string; consumption: string }[];
}
