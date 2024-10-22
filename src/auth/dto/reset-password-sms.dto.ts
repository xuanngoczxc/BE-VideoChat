import { IsString, MinLength } from "class-validator";

export class VerifyOtpDto {
    @IsString()
    phoneNumber: string;

    @IsString()
    @MinLength(6)
    otp: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}