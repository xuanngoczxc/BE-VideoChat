import { AutoMap } from "@automapper/classes";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString, Min } from "class-validator";

export class PaginationDto {

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @Min(1)
    @Type(() => Number)
    limit?: number;
    
    @IsOptional()
    @IsString()
    search?: string;
}