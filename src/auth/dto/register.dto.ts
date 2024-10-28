import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {

    @ApiProperty()
    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(1)
    loginName: string;

    @ApiProperty()
    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(1)
    fullName: string;
    
    @ApiProperty()
    @IsEmail()
    email: string;
    
    @ApiProperty()
    @IsString()
    @MinLength(6)
    @Transform(({value}) => value.trim())
    password: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    @Transform(({value}) => value.trim())
    rePassword: string;

}