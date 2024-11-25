import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LopHoc } from 'src/users/entity/class.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './create-class.dto';
import { RequestJoinDto } from './request-join.dto';


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
    if (isNaN(userId)) {
      throw new BadRequestException('User ID phải là số nguyên hợp lệ');
    }

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

  async checkClassExistence(maLop: string): Promise<boolean> {
    const lopHoc = await this.classRepository.findOne({ where: { MaLop: maLop } });
    return !!lopHoc; // Trả về true nếu mã lớp tồn tại, false nếu không
  }

  async handleJoinRequest({ userId, fullName, classCode }: RequestJoinDto) {
    if (isNaN(userId)) {
      throw new BadRequestException('Id người dùng phải là số hợp lệ');
    }
  
    const classExists = await this.classRepository.findOne({ where: { MaLop: classCode } });
    if (!classExists) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }
  
    const userExists = await this.userRepository.findOne({ where: { id: userId } });
    if (!userExists) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
  
    return {
      message: `Yêu cầu tham gia lớp học với mã ${classCode} đã được gửi.`,
      status: 'pending',
    };
  }
  
    

  async approveJoinRequest(userId: number, classCode: string) {
    const lopHoc = await this.classRepository.findOne({ where: { MaLop: classCode } });
    if (!lopHoc) {
        throw new NotFoundException('Không tìm thấy lớp học với mã này');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
    }

    // await this.classRepository.save(lopHoc);

    return {
        message: `Người dùng ${userId} đã được phê duyệt tham gia lớp ${classCode}.`,
        data: {
            userId,
            classCode,
            status: 'approved', // Trạng thái phê duyệt
        },
    };
  }

}