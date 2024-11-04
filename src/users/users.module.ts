import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserController } from './user.controller';
import { UserProfile } from './Mapconfig/user.profile';
import { ThongTinCaNhan } from 'src/users/entity/profile.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ThongTinCaNhan])],
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService]
})
export class UsersModule {}
