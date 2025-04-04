
import { ApiProperty } from '@nestjs/swagger';
import { Company } from '../../entities/company.entity';



export class CompanyResponseDTO {

    @ApiProperty({ example: 1 })
    readonly current_page: number;

    @ApiProperty({ example: 1 })
    readonly total_pages: number;

    @ApiProperty({ example: 10 })
    readonly total_per_pages: number;

    @ApiProperty({ type: [Company] })
    readonly list: Company[];

    @ApiProperty({ example: 1 })
    readonly totalItems: number;

    constructor(partial: Partial<CompanyResponseDTO>) {
        Object.assign(this, partial);
    }
}

