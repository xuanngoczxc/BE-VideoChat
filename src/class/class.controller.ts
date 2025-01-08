import { RequestJoinDto } from './request-join.dto';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClassService } from './class.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LopHoc } from 'src/users/entity/class.entity';
import { BadRequestException } from '@nestjs/common';
import { UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { AttendanceDto } from './attendance.dto';
import { OutClassDto } from './out-class.dto';


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
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      throw new BadRequestException('Dữ liệu điểm danh không hợp lệ hoặc rỗng.');
    }

    try {
      await this.classService.saveAttendanceData(attendanceData);
      return { message: 'Dữ liệu điểm danh đã được lưu thành công' };
    } catch (error) {
      throw new BadRequestException(`Lỗi khi lưu dữ liệu: ${error.message}`);
    }
  }

  @Post('history-call')
  async saveHistoryCall(@Body() body: any) {
    try {
      await this.classService.saveHistoryCall(body);  
      return { message: 'Lịch sử cuộc gọi đã được lưu thành công.' };
    } catch (error) {
      return { message: 'Lỗi khi lưu lịch sử cuộc gọi.', error: error.message };
    }
  }

  @Post(':userId')
  async createLopHoc(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: any
  ): Promise<LopHoc> {
    return this.classService.createLopHoc(userId, body);
  }

  @Post('out-class/:MaLop')
  async outLopHoc(@Param('MaLop') MaLop: string): Promise<string> {
    return this.classService.outClass(MaLop);
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
