import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TwilioService } from 'nestjs-twilio';
import { SendOtpDto } from './dto/send-sms.dto';
import { VerifyOtpDto } from './dto/reset-password-sms.dto';
import { join } from 'path';
import * as crypto from 'crypto';
import { VerifyOTPDto } from './dto/VerifyOTP.dto';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly twilioService: TwilioService
    ){}

    async register(registerDto: RegisterDto) {
        const { loginName, fullName, email, password, rePassword } = registerDto;
    
        // Check if email already exists
        const checkEmail = await this.usersService.findOneByEmail(email);
        if (checkEmail) {
            throw new BadRequestException('Email người dùng đã tồn tại');
        }

        const checkloginName = await this.usersService.findOneByLoginName(loginName);
        if (checkloginName) {
            throw new BadRequestException('Tên đăng nhập đã tồn tại');
        }
    
        const user = await this.usersService.registerUser({
            loginName,
            fullName,
            email,
            password,
            rePassword,
        });
    
        return {
            code: 'SUCCESS',
            message: 'Đăng ký thành công',
        };
    }
    

    async login({loginName, password}: LoginDto) {
        const user = await this.usersService.findOneByLoginName(loginName);
        if(!user) {
            throw new UnauthorizedException('Tên đăng nhập không đúng');
        }
        let isPasswordValid = false;

        if(user.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            isPasswordValid = password === user.password;
        }

        if(!isPasswordValid){
            throw new UnauthorizedException('password không đúng');
        }

        const payload = { loginName: user.loginName, id: user.id, role: user.role};
        const accessToken = await this.jwtService.signAsync(payload,{
            expiresIn: '2m'
        });

        const refreshToken = await this.jwtService.signAsync(payload,{
            expiresIn: '10m'
        });

        return { 
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const { email, id } = payload;
    
            const newPayload = { email, id };
            const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '2m' });
            const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '10m' });

            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async changePassword(userEmail: string, changePasswordDto: ChangePasswordDto) {
        const { oldPassword, newPassword } = changePasswordDto;
        const user = await this.usersService.findOneByEmail(userEmail);
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }
        let isCurrentPasswordValid = false;

        if (user.password.startsWith('$2b$')) {
            isCurrentPasswordValid = await bcrypt.compare(oldPassword, user.password);
        } else {
            isCurrentPasswordValid = oldPassword === user.password;
        }

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const updateUserDto: UpdateUserDto = {
            loginName: user.loginName,
            email: user.email,
            password: hashedNewPassword
        }
        await this.usersService.update(user.id, updateUserDto);
        return { message: 'Đổi mật khẩu thành công' };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
          throw new NotFoundException('Người dùng không tồn tại');
        }
      
        const otp = this.generateOTP();
        const expiresIn = 10 * 60 * 1000;
        const expiresAt = new Date(Date.now() + expiresIn);
      
        await this.usersService.saveOTP(email, otp, expiresAt);
        await this.example(email, otp, user.loginName);
      
        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    }

    async verifyOTP(verifyOTPDto: VerifyOTPDto, email: string) {
        const { otp } = verifyOTPDto;
        const isValidOTP = await this.usersService.verifyOTP(email, otp);
        if (!isValidOTP) {
            throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }
        
        return { message: 'OTP xác thực thành công' };
    }
    
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { email, otp, newPassword } = resetPasswordDto;
        const isValidOTP = await this.usersService.verifyOTP(email, otp);
        if (!isValidOTP) {
            throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(email, hashedNewPassword);
        await this.usersService.deleteOTP(email);

        return { message: 'Đặt lại mật khẩu thành công' };
    }
    
    // private generateOTP(): string {
    //     return Math.floor(100000 + Math.random() * 900000).toString();
    // }

    private generateOTP(): string {
        return crypto.randomInt(100000, 1000000).toString();
    }

    private async example(email: string, otp: string, name: string): Promise<void> {
        try {
          await this.mailerService.sendMail({
            to: email,
            from: `"NestJS" <xuanngoczxc@gmail.com>`,
            subject: 'Your OTP Code',
            template: './send',
            context: {
                name, otp
            }
          });
          console.log('OTP email sent successfully');
        } catch (error) {
          console.error('Error sending OTP email', error);
        }
    }

    // async sendSMS(phoneNumber: string): Promise<void> {
    //     const otp = this.generateOTP();
    //     this.twilioService.client.messages.create({
    //         body: 'SMS Body',
    //         from: '+1 646 846 7090',
    //         to: phoneNumber,
    //     })
    // }

    async sendSMS(sendOtpDto: SendOtpDto): Promise<{ message: string}> {
        const { phoneNumber } = sendOtpDto;
        const user = await this.usersService.findOneByPhoneNumber(phoneNumber);
        if(!user) {
            throw new NotFoundException ('Số điện thoại không tồn tại')
        }

        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await this.usersService.saveOTPSMS(user.phoneNumber, otp, expiresAt)
        await this.twilioService.client.messages.create({
            body:`Mã xác thực của bạn là ${otp}`,
            from: '+1 646 846 7090',
            to: phoneNumber,
        });
        return { message: 'OTP đã được gửi đến số điện thoại của bạn'}
    }

    async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ message: string }> {
        const { phoneNumber, otp, newPassword } = verifyOtpDto;
        const user = await this.usersService.findOneByPhoneNumber(phoneNumber);
        if (!user) {
            throw new NotFoundException('Số điện thoại không tồn tại');
        }

        const isValidOTP = await this.usersService.verifyOTP(user.email, otp);
        if (!isValidOTP) {
            throw new NotFoundException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.email, hashedNewPassword);
        await this.usersService.deleteOTP(user.email);

        return { message: 'Đặt lại mật khẩu thành công' };
    }
    
    async profile({ email, id, role}: {email: string, id: number, role: string}) {
        return await this.usersService.findOneByEmail(email);
    }

}