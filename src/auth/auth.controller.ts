import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Put, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { Request } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TwilioService } from 'nestjs-twilio';
import { SendOtpDto } from './dto/send-sms.dto';
import { VerifyOtpDto } from './dto/reset-password-sms.dto';

interface RequestWithUser extends Request {
    user: {
        email: string;
        id: number;
        role:string
    }
}

@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
    ){}

    @Post('register')
    register(@Body() registerDto: RegisterDto,) {
        return this.authService.register(registerDto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    // @UseGuards(AuthGuard)
    profile(@Req() req: RequestWithUser ) { 
        return this.authService.profile(req.user)
    }

    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refresh(refreshTokenDto.refreshToken);
    }

    // @UseGuards(AuthGuard)
    @Patch('changepass')
    async changePassword(@Req() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.email, changePasswordDto);
    }

    //email

    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    // @Post('send-sms')
    // async sendSMS(@Body('phoneNumber') phoneNumber: string): Promise<{ message: string }> {
    //     await this.authService.sendSMS(phoneNumber);
    //     return { message: 'OTP sent successfully' };
    // }

    //SMS

    @Post('send-otp')
    async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{ message: string }> {
        return this.authService.sendSMS(sendOtpDto);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
        return this.authService.verifyOtp(verifyOtpDto);
    }


}
