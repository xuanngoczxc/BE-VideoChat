import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class OutClassDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsString()
  MaLop: string;
}
