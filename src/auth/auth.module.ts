import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/module/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m'},
    }),
    TwilioModule.forRoot({
      accountSid: 'ACeb74069b93f7e5bc46db6a3c77188e20',
      authToken: 'ef668bd62ee93ec00f3c5ef8e08d01aa'
    }),
  ],
  exports: [AuthService]
})
export class AuthModule {}
