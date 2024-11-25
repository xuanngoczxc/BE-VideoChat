import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import 'winston-daily-rotate-file';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthGuard } from './auth/guard/auth.guard';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule,{
    logger: WinstonModule.createLogger({
      transports: [
        new transports.DailyRotateFile({
          filename:`logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d'
        }),
        new transports.DailyRotateFile({
          filename: `logs/%DATE%-combined.log`,
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
  });

  app.enableCors({
    origin: '*',  // Cho phép frontend ở địa chỉ này
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Nếu bạn muốn hỗ trợ cookie
    allowedHeaders: ['Authorization', 'Content-Type']
  });

  const config = new DocumentBuilder()
  .setTitle('Video chat example')
  .setDescription('API of online learning application')
  .setVersion('2.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // loại bỏ các trường không được định nghĩa
    forbidNonWhitelisted: false, // ném lỗi nếu có trường không được định nghĩa
    transform: true, // tự động chuyển đổi kiểu
    disableErrorMessages: false
  }));

    // Import IoAdapter if it's not already imported
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(5000, '0.0.0.0');
    console.log(`API docs are available at: ${await app.getUrl()}/api`);
}
bootstrap();