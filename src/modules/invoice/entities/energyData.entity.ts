import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

export enum EnergyDataType {
  energyEletric = 'energyEletric',
  energySCEE = 'energySCEE',
  compensatedEnergy = 'compensatedEnergy',
}
@Entity()
export class EnergyData {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column({ type: 'enum', enum: EnergyDataType })
  @ApiProperty({ example: EnergyDataType.energyEletric, enum: EnergyDataType })
  energyDataType: EnergyDataType;

  @Column('decimal', { precision: 10, scale: 4 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 4 })
  value: number;

  @Column('decimal', { precision: 10, scale: 8 })
  unitPrice: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.energyData)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  //   energyEletric
  // energySCEE
  // compensatedEnergy

  //   historicoConsumo
}

