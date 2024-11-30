import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entity/user.entity';
import { AuthModule } from './auth/auth.module';
import { RequestLoggerMiddleware } from './utils/request-logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants/jwt.constant';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { TwilioModule, TwilioService } from 'nestjs-twilio';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { OtpService } from './otp/otp.service';
import { ClassModule } from './class/class.module';
import { LopHoc } from './users/entity/class.entity';
import { LichSuCuocGoi } from './users/entity/history.entity';
import { ThongTinCaNhan } from './users/entity/profile.entity';
import { DiemDanh } from './users/entity/rollcall.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345',
      database: 'videoChat',
      entities: [User, LopHoc, LichSuCuocGoi, ThongTinCaNhan, DiemDanh],
      synchronize: true,
    }),UsersModule, AuthModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '30m'}
    }),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        // ignoreTLS: true,
        secure: false,
        auth: {
          user: "xuanngoczxc@gmail.com",
          pass: "pbwt guft fogv swry"
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: `"NestJS" <xuanngoczxc@gmail.com>`
      },
      preview: true,
      template: {
        dir: join(__dirname, '/templates') ,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ScheduleModule.forRoot(),
    ClassModule
  ],
  controllers: [AppController],
  providers: [AppService, OtpService],
})
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(RequestLoggerMiddleware).forRoutes('*');
//   }
// }

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*'); // Áp dụng middleware cho tất cả các tuyến đường
  }
}
