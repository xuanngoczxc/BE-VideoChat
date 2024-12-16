import { RequestJoinDto } from './request-join.dto';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClassService } from './class.service';
import { ApiTags } from '@nestjs/swagger';
import { LopHoc } from 'src/users/entity/class.entity';
import { BadRequestException } from '@nestjs/common';
import { UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { AttendanceDto } from './attendance.dto';


@ApiTags('Room-Class')
@Controller('class')
export class WebRTCController {
  constructor(private readonly classService: ClassService) {}

  @Post('request-join')
  requestJoin(@Body() body: RequestJoinDto) {
    return this.classService.handleJoinRequest(body);
  }

  @Post('attendance')
  async saveAttendance(@Body() attendanceData: AttendanceDto[]) {
    // console.log(attendanceData)
    // Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(attendanceData) || attendanceData.length <= 1) {
      throw new BadRequestException('Dữ liệu điểm danh không hợp lệ hoặc rỗng.');
    }

    // Loại bỏ dòng đầu tiên (tiêu đề) và cột đầu tiên (STT)
    // const formattedData = attendanceData.slice(1).map((row) => row.slice(1));

    // Gọi service để lưu dữ liệu
    try {
      await this.classService.saveAttendanceData(attendanceData);
      return { message: 'Dữ liệu điểm danh đã được lưu thành công' };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lưu dữ liệu: ${error.message}`);
    }
  }

  @Post(':userId')
  async createLopHoc(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: any // Không cần DTO, nhận trực tiếp body
  ): Promise<LopHoc> {
    return this.classService.createLopHoc(userId, body);
  }

  @Get('check-class/:MaLop')
  async checkClassExistence(@Param('MaLop') maLop: string) {
    const exists = await this.classService.checkClassExistence(maLop);
    if (exists) {
      return { exists: true, message: 'Lớp học tồn tại' };
    } else {
      return { exists: false, message: 'Lớp học không tồn tại' };
    }
  }

}
