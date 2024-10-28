import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('video-users')
@Controller('webrtc')
export class WebRTCController {
  constructor(private readonly webrtcService: WebRTCService) {}

  @Get('rooms')
  getRooms() {
    return this.webrtcService.getRooms();
  }

  @Post('room')
  createRoom(@Body() data: { roomName: string }) {
    return this.webrtcService.createRoom(data.roomName);
  }

  @Get('room/:id')
  getRoomInfo(@Param('id') id: string) {
    return this.webrtcService.getRoomInfo(id);
  }
}