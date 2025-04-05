
import { ApiProperty } from '@nestjs/swagger';
import { Invoice } from '../../entities/invoice.entity';



export class InvoiceResponseDTO {

    @ApiProperty({ example: 1 })
    readonly current_page: number;

    @ApiProperty({ example: 1 })
    readonly total_pages: number;

    @ApiProperty({ example: 10 })
    readonly total_per_pages: number;

    @ApiProperty({ type: [Invoice] })
    readonly list: Invoice[];

    @ApiProperty({ example: 1 })
    readonly totalItems: number;

    constructor(partial: Partial<InvoiceResponseDTO>) {
        Object.assign(this, partial);
    }
}

