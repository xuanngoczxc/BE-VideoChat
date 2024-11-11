import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt'
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ThongTinCaNhan } from 'src/users/entity/profile.entity';
import { UserDto } from './dto/user.dto';
import { profile } from 'console';
import { Role } from 'src/auth/enums/rol.enum';
import { UpdateProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  findUserWithPersonalInfo(loginName: string) {
      throw new Error('Method not implemented.');
  }

  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(ThongTinCaNhan)
      private readonly profileRepository: Repository<ThongTinCaNhan>,
      @InjectMapper() private readonly mapper: Mapper
  ){}

  async findAllWithProfile(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['thongTinCaNhan'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.mapper.map( createUserDto, CreateUserDto, User);
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
      user.password = hashedPassword;
      return this.userRepository.save(user)
    } catch (e) {
      console.error('Error creating user:', e);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async registerUser(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, password, rePassword, ...profileData } = registerUserDto;

    // Kiểm tra mật khẩu
    if (password !== rePassword) {
        throw new BadRequestException('Nhập lại mật khẩu không khớp');
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
        throw new BadRequestException('Email đã tồn tại');
    }

    // Tạo một đối tượng User mới từ DTO
    const user = new User();
    user.loginName = registerUserDto.loginName;
    user.fullName = registerUserDto.fullName;
    user.email = email;                  
    user.password = await bcrypt.hash(password, 10); 
    user.role = Role.User;                     

    const savedUser = await this.userRepository.save(user);

    const profile = await this.profileRepository.save({
        userId: savedUser.id,
        ...profileData,
    });

    return savedUser; 
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const search = paginationDto.search;

    const queryBuilder = this.userRepository.createQueryBuilder('users')
        .leftJoinAndSelect('users.thongTinCaNhan', 'thongTinCaNhan');

    if (search) {
        queryBuilder.where('unaccent(users.fullName) ILIKE unaccent(:search)', 
            { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();
    
    const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
        users,
        total,
        totalPages,
        currentPage: page,
    };
  }

  async saveOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update({ email }, { otp, otpExpires: expiresAt });
  }

  // async verifyOTP(email: string, otp: string): Promise<boolean> {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user || !user.otp || !user.otpExpires) {
  //     return false;
  //   }
  //   if (user.otp !== otp || user.otpExpires < new Date()) {
  //     return false;
  //   }
  //   return true;
  // }

  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.otp || !user.otpExpires) {
      return false;
    }
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return false;
    }
    return true;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOne(options: { where: any; relations?: string[] }): Promise<User> {
    const user = await this.userRepository.findOne(options);
    if (!user) {
        throw new NotFoundException('User not found.');
    }
    return user;
  }

  async findOneByLoginName(loginName: string): Promise<User> {
      return this.findOne({
          where: { loginName }
      });
  }

  async findOneByLoginNameRegister(loginName: string) {
    return await this.userRepository.findOneBy({ loginName });
  }

  async deleteOTP(email: string): Promise<void> {
    await this.userRepository.update({ email }, { otp: null, otpExpires: null });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  // async updatePassword(loginName: string, newPassword: string): Promise<void> {
  //   await this.userRepository.update({ loginName }, { password: newPassword });
  // }

  async saveOTPSMS(phoneNumber: string, otp: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update({ phoneNumber }, { otp, otpExpires: expiresAt });
  }

  async findOneById(id: number): Promise<User> {
      return this.userRepository.findOne({ where: { id } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return user;
  }

  async update(id: number, user: User): Promise<User> {
    await this.userRepository.update(id, user);
    return this.findById(id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Cập nhật mật khẩu người dùng
  async updatePassword(email: string, newPassword: string): Promise<void> {
      await this.userRepository.update({ email }, { password: newPassword });
  }

  async updateUserProfile(updatedPersonalInfo: ThongTinCaNhan): Promise<ThongTinCaNhan> {
    return this.profileRepository.save(updatedPersonalInfo);
  }

  async updateUser(updatedUser: User): Promise<User> {
    return this.userRepository.save(updatedUser);
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }


}