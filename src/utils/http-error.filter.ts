import { Catch, ExceptionFilter, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Trích xuất thông tin từ lỗi
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorDetails = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message: exceptionResponse,
    };

    // Log thông tin chi tiết lỗi
    this.logger.error(`HTTP Exception: ${JSON.stringify(errorDetails)}`);

    // Gửi lại lỗi cho client
    response.status(status).json(exceptionResponse);
  }
}
