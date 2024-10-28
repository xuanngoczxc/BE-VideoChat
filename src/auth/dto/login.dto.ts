import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {

    @ApiProperty()
    @IsString()
    loginName: string;

    @ApiProperty()
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    password: string;
}