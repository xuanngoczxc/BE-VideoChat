import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class AttendanceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  HoTen: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  TenDangNhap: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  Ngay: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  DiHoc: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  MaLop: string;
}
