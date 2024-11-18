import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LopHoc } from 'src/users/entity/class.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './create-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(LopHoc)
    private readonly classRepository: Repository<LopHoc>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createLopHoc(userId: number, body: any): Promise<LopHoc> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lopHoc = this.classRepository.create({
      ThoiGianTao: new Date(),
      Quyen: 'Admin',  // Mặc định là Admin
      user: user,      // Đảm bảo trường 'user' khớp với entity
      MaLop: this.generateRandomClassCode(),
    });

    return this.classRepository.save(lopHoc);
  }

  private generateRandomClassCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}