import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @AutoMap()
  readonly Hoten: string;

  @IsNotEmpty()
  @AutoMap()
  readonly NgaySinh: Date;

  @IsNotEmpty()
  @AutoMap()
  readonly Gioitinh: string;

  @IsNotEmpty()
  @AutoMap()
  readonly DiaChi: string;

  @IsNotEmpty()
  @AutoMap()
  readonly SoDienThoai: string;

  @IsNotEmpty()
  @AutoMap()
  readonly Email: string;

  @IsNotEmpty()
  @AutoMap()
  AnhDaiDien: string;
}
// Họ tên, ngày sinh, giới tính, địa chỉ, sdt, email