// // process.env.DEBUG = 'socket.io:*'; // Hiển thị mọi log liên quan đến socket.io

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
// import 'winston-daily-rotate-file';
// import { WinstonModule } from 'nest-winston';
// import { format, transports } from 'winston';
// import * as dotenv from 'dotenv';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { AuthGuard } from './auth/guard/auth.guard';
// import { BadRequestException } from '@nestjs/common';
// import { HttpErrorFilter } from './utils/http-error.filter'

// async function bootstrap() {
//   dotenv.config();
//   const app = await NestFactory.create(AppModule,{
//     logger: WinstonModule.createLogger({
//       transports: [
//         new transports.DailyRotateFile({
//           filename:`logs/%DATE%-error.log`,
//           level: 'error',
//           format: format.combine(format.timestamp(), format.json()),
//           datePattern: 'YYYY-MM-DD',
//           zippedArchive: false,
//           maxFiles: '30d'
//         }),
//         new transports.DailyRotateFile({
//           filename: `logs/%DATE%-combined.log`,
//           format: format.combine(format.timestamp(), format.json()),
//           datePattern: 'YYYY-MM-DD',
//           zippedArchive: false,
//           maxFiles: '30d',
//         }),
//         new transports.Console({
//           format: format.combine(
//             format.cli(),
//             format.splat(),
//             format.timestamp(),
//             format.printf((info) => {
//               return `${info.timestamp} ${info.level}: ${info.message}`;
//             }),
//           ),
//         }),
//       ],
//     }),
//   });

//   app.enableCors({
//     origin: '*',  // Cho phép frontend ở địa chỉ này
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true, // Nếu bạn muốn hỗ trợ cookie
//     allowedHeaders: ['Authorization', 'Content-Type']
//   });

//   const config = new DocumentBuilder()
//   .setTitle('Video chat example')
//   .setDescription('API of online learning application')
//   .setVersion('2.0')
//   .addBearerAuth()
//   .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document);
//   app.useGlobalPipes(new ValidationPipe({
//     whitelist: true, // loại bỏ các trường không được định nghĩa
//     forbidNonWhitelisted: true, // ném lỗi nếu có trường không được định nghĩa
//     transform: true, // tự động chuyển đổi kiểu
//     disableErrorMessages: false,
//     exceptionFactory: (errors) => {
//       console.error('Validation Errors:', errors);
//       return new BadRequestException(errors);
//     },
//   }));

//   app.useGlobalFilters(new HttpErrorFilter())

//     // Import IoAdapter if it's not already imported
//     app.useWebSocketAdapter(new IoAdapter(app));
//     await app.listen(5000, '0.0.0.0');
//     console.log(`API docs are available at: ${await app.getUrl()}/api`);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { BadRequestException } from '@nestjs/common';
import { HttpErrorFilter } from './utils/http-error.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new DailyRotateFile({
          filename: `logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new DailyRotateFile({
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

  // Enable CORS
  app.enableCors({
    origin: '*', // Cho phép frontend ở địa chỉ này
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Nếu bạn muốn hỗ trợ cookie
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  // Setup static files serving from the 'uploads' folder
  const staticPath = join(process.cwd(), 'src', 'uploads');
  console.log('Serving static files from:', staticPath);
  
  app.useStaticAssets(staticPath, {
    prefix: '/uploads/', // Đường dẫn URL bắt đầu với /uploads/
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Video chat example')
    .setDescription('API of online learning application')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Validation Pipe setup
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các trường không được định nghĩa
      forbidNonWhitelisted: true, // Ném lỗi nếu có trường không được định nghĩa
      transform: true, // Tự động chuyển đổi kiểu
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        console.error('Validation Errors:', errors);
        return new BadRequestException(errors);
      },
    }),
  );

  // Global filter for HTTP errors
  app.useGlobalFilters(new HttpErrorFilter());

  // WebSocket adapter setup
  app.useWebSocketAdapter(new IoAdapter(app));

  // Start the server
  await app.listen(5000, '0.0.0.0');
  console.log(`API docs are available at: ${await app.getUrl()}/api`);
}

bootstrap();
