import { Module } from '@nestjs/common';
import { WebRTCController } from './webrtc.controller';
import { WebRTCService } from './webrtc.service';

@Module({
  controllers: [WebRTCController],
  providers: [WebRTCService],
})
export class WebRTCModule {}