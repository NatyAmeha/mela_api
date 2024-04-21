import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { GatewayApiFetchResponse, UserInfo } from '@app/common/model/gateway_user.model';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Configuration } from 'apps/mela_api/configuration';
import axios from 'axios';
import { GraphQLError } from 'graphql';

@Injectable()
export class AppService {
  constructor() {

  }

  async validateJwtAndQueryUser(authorization?: string): Promise<GatewayApiFetchResponse> {
    try {
      var jwtService = new JwtService()
      var config = Configuration()
      if (authorization != undefined) {
        var token = (authorization)?.split(" ")[1]
        if (token) {
          var jwtPayload = await jwtService.verifyAsync(token, { secret: config.auth.accessToken })
          var userAccessApiEndpoint = config.auth.userAccessEndpointFromAuthService(jwtPayload.sub)
          var businessSubscriptionEndpoint = config.auth.businessSubscriptionEndpoint(jwtPayload.sub)
          var axiosresponse = await axios.get(userAccessApiEndpoint)
          var gatewayApiResponse = axiosresponse.data as GatewayApiFetchResponse
          if (!gatewayApiResponse) {
            throw new RequestValidationException({ message: "User not found by this id" })
          }
          return gatewayApiResponse
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
