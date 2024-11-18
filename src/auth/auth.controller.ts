import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Post, Put, Req, UseGuards, ValidationPipe, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TwilioService } from 'nestjs-twilio';
import { SendOtpDto } from './dto/send-sms.dto';
import { VerifyOtpDto } from './dto/reset-password-sms.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOTPDto } from './dto/VerifyOTP.dto';
import { UpdateProfileDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
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

    @UseGuards(AuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    async getProfile(@Req() request: Request) {
        const user = request['user'] as { loginName: string };
        return this.authService.profile(user);
    }

    @UseGuards(AuthGuard) 
    @ApiBearerAuth()
    @Put('update-profile')
    async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto, 
        @Request() req: any
    ) {
        const loginName = req.user.loginName;
        return this.authService.updateProfile(loginName, updateProfileDto);
    }

    @UseGuards(AuthGuard)
    @Post('change-password')
    @ApiBearerAuth()
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
        return this.authService.changePassword(changePasswordDto, req.user.id);
    }

    @Post('verify-otp-email')
    @ApiBearerAuth()
    async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto, otp: string) {
        return this.authService.verifyOTP(verifyOTPDto, otp);
    }

    //email

    // @Post('reset-password')
    // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    //     return this.authService.resetPassword(resetPasswordDto);
    // }

    @Post('reset-password/:email')
    async resetPassword(@Param('email') email: string, @Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(email, resetPasswordDto);
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

    // @Post('send-otp')
    // async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    //     return this.authService.sendSMS(sendOtpDto);
    // }

    // @Post('verify-otp-phone')
    // async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
    //     return this.authService.verifyOtp(verifyOtpDto);
    // }
}

