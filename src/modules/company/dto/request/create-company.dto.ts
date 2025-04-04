import {
    IsNotEmpty,
    IsString,
    IsEnum,
    Matches,
    IsOptional,
} from 'class-validator';
import { User } from '../../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'FulanoTech SA' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)
    @ApiProperty({ example: '11.111.111/1111-11' })
    cnpj: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Rua dos Bobos, nro 0' })
    address: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'São Paulo' })
    city: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'SP' })
    uf: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{5}\-\d{3}$/)
    @ApiProperty({ example: '01234-000' })
    cep: string;

    @IsOptional()
    @IsString({ each: true })
    @ApiProperty({ type: [String], example: ['e7d3c6c4-3b6d-4e7a-9eae-64c93f9f7f4f'] })
    userIds?: string[];

}
