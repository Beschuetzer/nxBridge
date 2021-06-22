import { Injectable } from '@nestjs/common';
import { Message } from '@nx-bridge/interfaces-and-types';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Welcome to api!' };
  }
}
