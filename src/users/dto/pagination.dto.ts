import { IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;
}