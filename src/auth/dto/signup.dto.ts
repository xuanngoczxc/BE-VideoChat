import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;
 
  @IsString()
  @IsNotEmpty()
  name: string;
 
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  password: string;
 
  @IsString()
  @IsNotEmpty()
//   @Matches(/^\+[1-9]\d{1,14}$/)
  phoneNumber: string;
}