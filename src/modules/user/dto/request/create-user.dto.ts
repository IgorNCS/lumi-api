import {
    IsOptional,
    IsNumber,
    Min,
    IsDateString,
    IsString,
    MaxLength,
    Max,
    IsNotEmpty,
    IsEnum,
  } from 'class-validator';
  import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../entities/user.entity';

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Fulano de tal' })
    name: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'fulano@gmail.com' })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'senhasecreta123' })
    password: string;

    @IsOptional()
    @IsEnum(Role)
    @ApiProperty({ example: 'costumer',description: 'Apenas ADMIN pode enviar' })
    role?: Role;
  
}



  