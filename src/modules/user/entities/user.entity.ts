import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  ADMIN = 'admin',
  COSTUMER = 'costumer',
}
export class User {
  // nCliente
  // 3001116735

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  id: string;

  @Column()
  @ApiProperty({ example: 'Fulano de tal' })
  name: string;

  @Column()
  @ApiProperty({ example: 'fulano@gmail.com' })
  email: string;

  @Column({ type: 'enum', enum: Role })
  @ApiProperty({ example: 'admin', enum: Role })
  role: Role;

  @Column('uuid', { unique: true, nullable: false })
  @ApiProperty({ example: 'e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f' })
  keycloakId: string;

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
