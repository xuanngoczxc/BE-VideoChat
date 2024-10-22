import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  logger: Logger;
  getHello(): string {
    return 'Hello World!';
  }
}
