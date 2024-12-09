import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LopHoc } from 'src/users/entity/class.entity';
import { User } from 'src/users/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './create-class.dto';
import { RequestJoinDto } from './request-join.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(LopHoc)
    private readonly classRepository: Repository<LopHoc>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly notificationGateway: NotificationGateway, // Inject Gateway
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

  // async handleJoinRequest({ userName, fullName, classCode }: RequestJoinDto) {
  //   if (!userName || !fullName || !classCode) {
  //     throw new BadRequestException('Thiếu thông tin cần thiết để tham gia lớp học');
  //   }    

  //   try {
  //     const classExists = await this.classRepository.findOne({ where: { MaLop: classCode } });
  //     if (!classExists) {
  //       throw new NotFoundException('Không tìm thấy lớp học');
  //     }
      
  //     const userExists = await this.userRepository.findOne({ where: { loginName: userName } });
  //     if (!userExists) {
  //       throw new NotFoundException('Người dùng không tồn tại');
  //     }
  //   } catch (error) {
  //     console.error('Có lỗi xảy ra khi xử lý yêu cầu:', error);
  //     throw new InternalServerErrorException('Có lỗi xảy ra khi xử lý yêu cầu');
  //   }

  //   // Gửi thông báo trực tiếp tới room dựa trên classCode
  //   const roomName = classCode;
  //   this.notificationGateway.sendJoinRequestNotification(
  //     roomName,
  //     { fullName, userName }, // Gửi đầy đủ thông tin
  //   );
  
  //   return {
  //     message: `Yêu cầu tham gia lớp học với mã ${classCode} đã được gửi.`,
  //     status: 'pending',
  //   };
  // }

  async handleJoinRequest({ userName, fullName, classCode }: RequestJoinDto) {
    if (!userName || !fullName || !classCode) {
      throw new BadRequestException('Thiếu thông tin cần thiết để tham gia lớp học');
    }
  
    try {
      // Kiểm tra xem lớp học có tồn tại không
      const classExists = await this.classRepository.findOne({ 
        where: { MaLop: classCode },
        relations: ['user'], // Tự động load thông tin người tạo lớp
      });
      if (!classExists) {
        throw new NotFoundException('Không tìm thấy lớp học');
      }
  
      // Kiểm tra xem người dùng có tồn tại không
      const userExists = await this.userRepository.findOne({ where: { loginName: userName } });
      if (!userExists) {
        throw new NotFoundException('Người dùng không tồn tại');
      }
  
      // Gửi thông báo đến người tạo lớp
      if (classExists.user) {
        this.notificationGateway.sendNotification(classExists.user.id, {
          title: 'Yêu cầu tham gia lớp học',
          message: `${fullName} đã yêu cầu tham gia lớp học.`,
        });
      }
  
      return {
        message: `Yêu cầu tham gia lớp học với mã ${classCode} đã được gửi.`,
        status: 'pending',
      };
    } catch (error) {
      console.error('Có lỗi xảy ra khi xử lý yêu cầu:', error);
      throw new InternalServerErrorException('Có lỗi xảy ra khi xử lý yêu cầu');
    }
  }
  

}