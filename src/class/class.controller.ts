import { RequestJoinDto } from './request-join.dto';
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClassService } from './class.service';
import { ApiTags } from '@nestjs/swagger';
import { LopHoc } from 'src/users/entity/class.entity';
import { BadRequestException } from '@nestjs/common';
import { UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';


@ApiTags('Room-Class')
@Controller('class')
export class WebRTCController {
  constructor(private readonly classService: ClassService) {}

  @Post('request-join')
  requestJoin(@Body() body: RequestJoinDto) {
    return this.classService.handleJoinRequest(body);
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
