import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClassService } from './class.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateClassDto } from './create-class.dto';
import { LopHoc } from 'src/users/entity/class.entity';
@ApiTags('Room-Class')
@Controller('class')
export class WebRTCController {
  constructor(private readonly classService: ClassService) {}

  @Post(':userId')
  async createLopHoc(
    @Param('userId') userId: number,
    @Body() body: any  // Không cần DTO, nhận trực tiếp body
  ) {
    return this.classService.createLopHoc(userId, body);
  }
}