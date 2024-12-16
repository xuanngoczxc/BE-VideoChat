import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { TwilioModule } from 'nestjs-twilio';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { ThongTinCaNhan } from 'src/users/entity/profile.entity';
import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOADS_DIR } from './constants';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, ThongTinCaNhan]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m'},
    }),
    MulterModule.register({
      dest: FILE_UPLOADS_DIR,
      limits: {
        fieldSize: 100 * 1000 *10
      }
    }),
    TwilioModule.forRoot({
      accountSid: 'ACeb74069b93f7e5bc46db6a3c77188e20',
      authToken: 'ef668bd62ee93ec00f3c5ef8e08d01aa'
    }),
  ],
  exports: [AuthService]
})
export class AuthModule {}