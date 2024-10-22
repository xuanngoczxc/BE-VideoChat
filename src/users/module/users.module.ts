import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UserController } from '../controller/user.controller';
import { UserProfile } from '../Mapconfig/user.profile';
import { ProfileModule } from 'src/profile/profile.module';
import { ThongTinCaNhan } from 'src/profile/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ThongTinCaNhan]), ProfileModule],
  providers: [UsersService, UserProfile],
  controllers: [UserController],
  // exports: [TypeOrmModule]
  exports: [UsersService]
})
export class UsersModule {}
