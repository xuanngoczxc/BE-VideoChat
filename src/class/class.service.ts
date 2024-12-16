import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LopHoc } from 'src/users/entity/class.entity';
import { User } from 'src/users/entity/user.entity';
import { DiemDanh } from 'src/users/entity/rollcall.entity';
import { Repository } from 'typeorm';
import { CreateClassDto } from './create-class.dto';
import { RequestJoinDto } from './request-join.dto';
import { AttendanceDto } from './attendance.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(LopHoc)
    private readonly classRepository: Repository<LopHoc>,
    
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(DiemDanh)
    private readonly rollCallRepository: Repository<DiemDanh>,

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
      Quyen: 'Admin',
      user: user,
      MaLop: this.generateRandomClassCode(),
    });

    return this.classRepository.save(lopHoc);
  }

  async outClass( MaLop: string): Promise<string> {

    const lopHoc = await this.classRepository.findOne({
      where: { MaLop: MaLop},
      relations: ['user'],
    });
  
    if (!lopHoc) {
      throw new NotFoundException('Lớp học không tồn tại');
    }

    await this.classRepository.remove(lopHoc);
    return `Mã lớp đã được xóa`;
  }

  private generateRandomClassCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async checkClassExistence(maLop: string): Promise<boolean> {
    const lopHoc = await this.classRepository.findOne({ where: { MaLop: maLop } });
    return !!lopHoc; // Trả về true nếu mã lớp tồn tại, false nếu không
  }

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

  // Hàm lưu dữ liệu điểm danh
  async saveAttendanceData(attendanceData: AttendanceDto[]): Promise<void> {
    try {
      // Lọc dữ liệu hợp lệ
      const validData = attendanceData.filter(
        (data) => data.HoTen && data.TenDangNhap && data.Ngay && data.DiHoc && data.MaLop
      ).map((data) => ({
        HoTen: data.HoTen,
        TenDangNhap: data.TenDangNhap,
        Ngay: new Date(data.Ngay),
        DiHoc: data.DiHoc,
        MaLop: data.MaLop,
      }));
  
      if (validData.length === 0) {
        throw new Error('Không có dữ liệu hợp lệ để lưu.');
      }
  
      // Lưu toàn bộ dữ liệu cùng lúc
      await this.rollCallRepository.save(validData);
  
      console.log('Tất cả dữ liệu hợp lệ đã được lưu.');
    } catch (error) {
      throw new Error(`Không thể lưu dữ liệu điểm danh: ${error.message}`);
    }
  }
}