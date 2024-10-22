import { AutoMap } from '@automapper/classes';
import { IsOptional, IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @AutoMap()
  readonly loginName: string;

  @IsNotEmpty()
  @AutoMap()
  readonly email: string;

  @IsNotEmpty()
  @AutoMap()
  readonly password: string;
}
