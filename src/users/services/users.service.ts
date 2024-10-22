import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { UpdateProfileDto } from 'src/profile/dto/updateProfile.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import * as bcrypt from 'bcrypt'
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ThongTinCaNhan } from 'src/profile/profile.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  update(id: number, updateUserDto: UpdateUserDto) {
      throw new Error('Method not implemented.');
  }

  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(ThongTinCaNhan)
      private readonly profileRepository: Repository<ThongTinCaNhan>,
      @InjectMapper() private readonly mapper: Mapper
  ){}

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
    const { email, password, rePassword } = registerUserDto;

    // Check if passwords match
    if (password !== rePassword) {
      throw new BadRequestException('Nhập lại mật khẩu không khớp');
    }

    // Check if email is already taken
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    // Map DTO to User entity and hash password
    const user = this.mapper.map(registerUserDto, RegisterUserDto, User);
    user.password = await bcrypt.hash(password, 10); // Hash the password here

    return this.userRepository.save(user); // Save the new user
}

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOneByLoginName(loginName: string) {
    return await this.userRepository.findOneBy({ loginName });
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.photos','photos')
    if (search) {
        queryBuilder.where('unaccent(user.name) ILIKE unaccent(:search)', { search: `%${search}%` });
    }
    const total = await queryBuilder.getCount();
    const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany()
    const totalPages = Math.ceil(total / limit);
    return {
        users,
        total,
        totalPages,
        currentPage: page,
    };
  }

  async findSearchUsers(name: string): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photos', 'photo')
      .where('user.name = :name', {name})
      .getMany();
    return users;
  }

  async findAll(paginationDto: PaginationDto, search?: string): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.photos','photos');

    if (search) {
        queryBuilder.where('unaccent(user.name) ILIKE unaccent(:search)', { search: `%${search}%` });
    }
    const total = await queryBuilder.getCount();
    const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany()
    const totalPages = Math.ceil(total / limit);
    return {
      users,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number): Promise<User> {
      return await this.userRepository.findOne({
        where: { id },
        relations: ['photos'],
      });
  }

  // async update(id: number, UpdateProfileDto, profileUpdates?: ThongTinCaNhan[]): Promise<User> {
  //   await this.userRepository.update(id, UpdateProfileDto);

  //   const user = await this.userRepository.findOne({
  //     where: { id },
  //     relations: ['photos'],
  //   });
  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   const updateUser = this.mapper.map(UpdateProfileDto, UpdateProfileDto, User);
  //   updateUser.id = id;

  //   await this.userRepository.save(updateUser)
  //   if (profileUpdates) {
  //     for (const photoUpdate of profileUpdates) {
  //       const profile = user.thongTinCaNhan.find(p => p.id === profileUpdates.id);
  //       if (profile) {
  //         profile.Email = profileUpdates.url;
  //         await this.profileRepository.save(profile);
  //       } else {
  //         const newPhoto = this.profileRepository.create({ ...profileUpdates, user });
  //         await this.profileRepository.save(newPhoto);
  //       }
  //     }
  //   }
  //   return this.userRepository.findOne({ where: { id }, relations: ['photos'] });
  // }

  // async remove(id: number): Promise<void> {
  //   const user = await this.userRepository.findOne({
  //     where: { id },
  //     relations: ['photos'],
  //   });
  
  //   if (!user) {
  //     throw new Error('User not found');
  //   }
  //   await this.profileRepository.delete(user.thongTinCaNhan.map(photo => photo.id));
  //   await this.userRepository.delete(id);
  // }

  async setRefreshToken(id: number, refreshToken: string) {
    await this.userRepository.update(id, { refreshToken});
  }

  async saveOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update({ email }, { otp, otpExpires: expiresAt });
  }

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

  async deleteOTP(email: string): Promise<void> {
    await this.userRepository.update({ email }, { otp: null, otpExpires: null });
  }

  async findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { phoneNumber } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    await this.userRepository.update({ email }, { password: newPassword });
  }

  async saveOTPSMS(phoneNumber: string, otp: string, expiresAt: Date): Promise<void> {
    await this.userRepository.update({ phoneNumber }, { otp, otpExpires: expiresAt });
  }

}