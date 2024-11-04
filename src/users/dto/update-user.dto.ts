import { IsString, IsDate, IsOptional } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    NgaySinh?: Date;

    @IsOptional()
    @IsString()
    GioiTinh?: string;

    @IsOptional()
    @IsString()
    DiaChi?: string;

    @IsOptional()
    @IsString()
    SoDienThoai?: string;

    @IsOptional()
    @IsString()
    AnhDaiDien?: string;
}
