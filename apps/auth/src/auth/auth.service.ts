import { CommonService } from '@app/common';
import { Injectable } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(private commonService: CommonService) { 

  }
  getHello(): string {
    return this.commonService.getDataFromCommongLib();
  }
}
