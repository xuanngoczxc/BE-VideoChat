import { IsOptional, IsString } from "class-validator";

export class CreateFileDto {
    @IsOptional()
    @IsString()
    descriptions?: string;
}