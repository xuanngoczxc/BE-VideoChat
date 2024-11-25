// import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class RequestLoggerMiddleware implements NestMiddleware {
//   private readonly logger = new Logger();

//   use(req: Request, res: Response, next: NextFunction) {
//     res.on('finish', () => {
//       const statusCode = res.statusCode;
//       if (statusCode === 401 || statusCode === 404 || statusCode === 405) {
//         this.logger.warn(`[${req.method}] ${req.url} - ${statusCode}`);
//       }
//     });

//     next();
//   }
// }

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query } = req; // Lấy thông tin cơ bản từ request
    const startTime = Date.now();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log toàn bộ thông tin
      this.logger.log(
        `[${method}] ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`,
      );

      // Log chi tiết body và query params
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
      this.logger.debug(`Query Params: ${JSON.stringify(query)}`);

      // Log cảnh báo nếu mã trạng thái không mong muốn
      if (statusCode === 401 || statusCode === 404 || statusCode === 405) {
        this.logger.warn(`[${method}] ${originalUrl} - ${statusCode}`);
      }
    });

    next();
  }
}
