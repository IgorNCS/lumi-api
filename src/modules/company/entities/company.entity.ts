import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: 'FulanoTech SA' })
  name: string;

  @Column()
  @ApiProperty({ example: '12345678901234' })
  cnpj: string;

  @Column()
  @ApiProperty({ example: 'Rua dos Bobos, nro 0' })
  address: string;

  @Column()
  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @Column()
  @ApiProperty({ example: 'SP' })
  uf: string;

  @Column()
  @ApiProperty({ example: '01234-000' })
  cep: string;

  @ManyToMany(() => User, (user) => user.companies, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'company_user',
    joinColumn: {
      name: 'company_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  companyInvoices: Invoice[];

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

