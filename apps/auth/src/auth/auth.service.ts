import { Injectable } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  getHello(): string {
    return 'Hello World!';
  }
}
