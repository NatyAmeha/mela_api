import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { UserInfo } from '@app/common/model/gateway_user.model';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { GraphQLError } from 'graphql';

@Injectable()
export class AppService {
  constructor() {

  }

  async validateJwtAndQueryUser(authorization?: string): Promise<UserInfo> {
    var jwtService = new JwtService()
    try {
      if (authorization != undefined) {
        var token = (authorization)?.split(" ")[1]
        if (token) {
          var jwtPayload = await jwtService.verifyAsync(token, { secret: "DEFAULTACCESSTOKEN" })
          var response = await axios.get(`http://localhost:3002/access?user=${jwtPayload.sub}`)
          var userInfo = response.data as UserInfo
          if (!userInfo) {
            throw new RequestValidationException({ message: "Not user found by this id" })
          }
          return userInfo
        }
      }
    } catch (ex) {
      throw new GraphQLError(ex.message, {
        extensions: {
          code: 401,
          http: { status: 401 },
        },
      });
    }
  }

}
