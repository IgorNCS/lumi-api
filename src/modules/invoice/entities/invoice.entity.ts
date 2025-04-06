import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../user/entities/user.entity';
import { EnergyData } from './energyData.entity';
import { HistoryEnergy } from './historyEnergy.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: '7204076116' })
  installation: string;

  @Column()
  @ApiProperty({ example: '3001116735' })
  client: string;

  @Column()
  @ApiProperty({ example: '12/02/2024' })
  dueDate: string;

  @Column('decimal', { precision: 10, scale: 4 })
  @ApiProperty({ example: 234.5678 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 4 })
  @ApiProperty({ example: 12.3456 })
  publicContribution: number;

  @Column()
  @ApiProperty({ example: '115591996' })
  notaFiscal: string;

  @Column()
  @ApiProperty({ example: 'JAN/24' })
  referencyMonth: string;

  @Column()
  @ApiProperty({ example: 'Verde' })
  band: string;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ type: () => User })
  user: User;


  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  @ApiProperty({ type: () => Company })
  company: Company;


  @OneToMany(() => EnergyData, (energyData) => energyData.invoice, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => EnergyData })
  energyData: EnergyData;


  @OneToMany(() => HistoryEnergy, (historyEnergy) => historyEnergy.invoice, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => HistoryEnergy })
  historyEnergy: HistoryEnergy;

  @Column()
  path:string;

  @Column()
  @ApiProperty({ example: 'JOSE MESALY FONSECA DE CARVALHO' })
  name:string

  @Column({default: 'CEMIG'})
  @ApiProperty({ example: 'CEMIG' })
  distributor:string

  @CreateDateColumn()
  @ApiProperty({ example: '2025-02-20T14:30:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: '2025-02-22T14:30:00.000Z' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  @ApiProperty({ example: '2025-02-24T14:30:00.000Z', nullable: true })
  deletedAt: Date | null;
}