import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class VerifyOTPDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  otp: string;
}
