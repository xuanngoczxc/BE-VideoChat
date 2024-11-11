import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { TwilioService } from 'nestjs-twilio';
import { SendOtpDto } from './dto/send-sms.dto';
import { VerifyOtpDto } from './dto/reset-password-sms.dto';
import { join } from 'path';
import * as crypto from 'crypto';
import { VerifyOTPDto } from './dto/VerifyOTP.dto';
import { jwtConstants } from './constants/jwt.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { ThongTinCaNhan } from 'src/users/entity/profile.entity';
import { UpdateProfileDto } from 'src/users/dto/update-user.dto';
import { Role } from './enums/rol.enum';
import * as fs from 'fs';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly twilioService: TwilioService,
        @InjectRepository(ThongTinCaNhan)
        private readonly profileRepository: Repository<ThongTinCaNhan>
    ){}

    async register(registerDto: RegisterDto) {
        const { loginName, fullName, email, password, rePassword } = registerDto;
    
        // Check if email already exists
        const checkEmail = await this.usersService.findOneByEmail(email);
        if (checkEmail) {
            throw new BadRequestException('Email người dùng đã tồn tại');
        }

        const checkloginName = await this.usersService.findOneByLoginNameRegister(loginName);
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
            secret: jwtConstants.secret,
            expiresIn: '1d'
        });

        const refreshToken = await this.jwtService.signAsync(payload,{
            secret: jwtConstants.secret,
            expiresIn: '1d'
        });

        return { 
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }

    async profile(user: { loginName: string }) {
        const foundUser = await this.usersService.findOne({
            where: { loginName: user.loginName },
            relations: ['thongTinCaNhan']
        });

        if (!foundUser) {
            throw new UnauthorizedException('Người dùng không tồn tại.');
        }

        const personalInfo = foundUser.thongTinCaNhan;
        
        return {
            id: foundUser.id,
            email: foundUser.email,
            role: foundUser.role,
            fullName: foundUser.fullName,
            loginName: foundUser.loginName,
            NgaySinh: personalInfo?.NgaySinh,
            GioiTinh: personalInfo?.GioiTinh,
            DiaChi: personalInfo?.DiaChi,
            SoDienThoai: personalInfo?.SoDienThoai,
            AnhDaiDien: personalInfo?.AnhDaiDien,
        };
    }

    async updateProfile(loginName: string, updateProfileDto: UpdateProfileDto) {
        let user = await this.usersService.findOneByLoginName(loginName);
    
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUserWithEmail = await this.usersService.findOneByEmail(updateProfileDto.email);
            if (existingUserWithEmail) {
                throw new ConflictException('Email đã tồn tại');
            }
        }

        if (!user.thongTinCaNhan) {
            user.thongTinCaNhan = new ThongTinCaNhan();
            user.thongTinCaNhan.userId = user.id;
        }

        if (updateProfileDto.NgaySinh !== undefined) {
            user.thongTinCaNhan.NgaySinh = updateProfileDto.NgaySinh ? this.parseDate(updateProfileDto.NgaySinh) : null;
        }
    
        user.thongTinCaNhan.GioiTinh = updateProfileDto.GioiTinh ?? user.thongTinCaNhan.GioiTinh;
        user.thongTinCaNhan.DiaChi = updateProfileDto.DiaChi ?? user.thongTinCaNhan.DiaChi;
        user.thongTinCaNhan.SoDienThoai = updateProfileDto.SoDienThoai ?? user.thongTinCaNhan.SoDienThoai;
        user.thongTinCaNhan.AnhDaiDien = updateProfileDto.AnhDaiDien ?? user.thongTinCaNhan.AnhDaiDien;

        user.fullName = updateProfileDto.fullName ?? user.fullName;
        user.email = updateProfileDto.email ?? user.email;
    
        console.log('Cập nhật người dùng:', user);

        await this.usersService.save(user);
        await this.profileRepository.save(user.thongTinCaNhan);
        return this.usersService.findOneByLoginName(loginName);
    }
    
    private parseDate(dateString: string): Date {
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`);
    }
    
    async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
        const { oldPassword, newPassword } = changePasswordDto;
        const user = await this.usersService.findById(userId);
    
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
    
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException('Mật khẩu cũ không đúng');
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, user);
        return { message: 'Mật khẩu đã được cập nhật thành công' };
      }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.usersService.findOneByEmail(email);  // Kiểm tra người dùng có tồn tại không
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }

        const otp = this.generateOTP();  // Tạo OTP
        const expiresIn = 10 * 60 * 1000;  // OTP hết hạn sau 10 phút
        const expiresAt = new Date(Date.now() + expiresIn);  // Thời gian OTP hết hạn

        await this.usersService.saveOTP(email, otp, expiresAt);  // Lưu OTP vào cơ sở dữ liệu hoặc cache
        await this.example(email, otp, user.loginName);  // Gửi email chứa OTP

        return { message: 'Mã OTP đã được gửi đến email của bạn', otp };  // Trả về OTP cho frontend nếu cần
    }

    async verifyOTP(verifyOTPDto: VerifyOTPDto, email: string) {
        const { otp } = verifyOTPDto;
        const isValidOTP = await this.usersService.verifyOTP(email, otp);
        if (!isValidOTP) {
            throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
        }
        return { message: 'OTP xác thực thành công' };
    }
    
    async resetPassword(email: string, resetPasswordDto: ResetPasswordDto) {
        const { newPassword, rePassword } = resetPasswordDto;

        if (newPassword !== rePassword) {
            throw new BadRequestException('Mật khẩu mới và mật khẩu xác nhận không khớp');
        }

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng với email này');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(email, hashedNewPassword);
        return { message: 'Đặt lại mật khẩu thành công' };
    }

    // async resetPassword(resetPasswordDto: ResetPasswordDto) {
    //     const { email, otp, newPassword } = resetPasswordDto;
    //     const isValidOTP = await this.usersService.verifyOTP(email, otp);
    //     if (!isValidOTP) {
    //         throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn');
    //     }

    //     const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    //     await this.usersService.updatePassword(email, hashedNewPassword);
    //     await this.usersService.deleteOTP(email);

    //     return { message: 'Đặt lại mật khẩu thành công' };
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
    
}