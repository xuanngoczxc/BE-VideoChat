import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { number } from "joi";

export class RequestJoinDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  // @Type(() => number)
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true }) // Chuyển đổi chuỗi số thành số
  userId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classCode: string;
}
