import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsDate, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsOptional()
  fullName?: string;

  @ApiProperty()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  NgaySinh?: string;

  @ApiProperty()
  @IsOptional()
  GioiTinh?: string;

  @ApiProperty()
  @IsOptional()
  DiaChi?: string;

  @ApiProperty()
  @IsOptional()
  SoDienThoai?: string;

  @ApiProperty()
  @IsOptional()
  AnhDaiDien?: string;
}
