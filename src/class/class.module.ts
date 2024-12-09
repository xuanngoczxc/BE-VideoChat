import { Module } from '@nestjs/common';
import { WebRTCController } from './class.controller';
import { ClassService } from './class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LopHoc } from 'src/users/entity/class.entity';
import { User } from 'src/users/entity/user.entity';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports:[TypeOrmModule.forFeature([LopHoc, User])],
  controllers: [WebRTCController],
  providers: [ClassService, NotificationGateway],
})
export class ClassModule {}