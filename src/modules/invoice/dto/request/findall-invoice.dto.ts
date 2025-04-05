import {
  IsOptional,
  IsNumber,
  Min,
  IsDateString,
  IsString,
  MaxLength,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationInvoiceRequest {
  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: 'Data inicial de criação da Empresa',
  })
  initialDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: 'Data final de criação da Empresa',
  })
  finalDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 1 })
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiProperty({ example: 10 })
  limit?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @ApiProperty({ example: 100 })
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @ApiProperty({ example: 1000 })
  maxAmount?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], example: ['e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f'] })
  companiyIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], example: ['e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f'] })
  userIds?: string[];

}