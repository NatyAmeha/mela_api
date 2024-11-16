import { RequestValidationException } from '@app/common/errors/request_validation_exception';
import { GatewayApiFetchResponse, UserInfo } from '@app/common/model/gateway_user.model';
import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Configuration } from 'apps/mela_api/configuration';
import axios from 'axios';
import { GraphQLError } from 'graphql';

@Injectable()
export class AppService {
  constructor() {

  }

  async validateJwtAndQueryUser({ authorization, authServiceEndpoint, coreServiceEndpoint, bypassToken }: { authorization?: string, authServiceEndpoint?: string, coreServiceEndpoint?: string, bypassToken?: boolean }): Promise<GatewayApiFetchResponse> {
    try {
      var jwtService = new JwtService()
      var config = Configuration()
      if (authorization != undefined) {
        var token = (authorization)?.split(" ")[1]
        if (token) {

          try {
            var jwtPayload = await jwtService.verifyAsync(token, { secret: config.auth.accessToken })
            var userAccessApiEndpoint = config.auth.userAccessEndpointFromAuthService(authServiceEndpoint, jwtPayload.sub)
            var axiosresponse = await axios.get(userAccessApiEndpoint)
            const { user, accesses } = axiosresponse.data as GatewayApiFetchResponse
            const { favoriteBusinesses, ...resetUserInfo } = user;
            var gatewayApiResponse = new GatewayApiFetchResponse({ user: { ...resetUserInfo, favoriteBusinesses: favoriteBusinesses.map(business => ({ businessId: business.businessId })) }, accesses })
            console.log('axiosresponse', favoriteBusinesses, gatewayApiResponse.user?.favoriteBusinesses)
            if (!gatewayApiResponse) {
              throw new RequestValidationException({ message: "User not found by this id" })
            }
            return gatewayApiResponse
          } catch (ex) {
            console.log('ex', ex)
            if (bypassToken) {
              return {}
            }
            throw new UnauthorizedException();
          }
        }
      }
    } catch (ex) {
      console.log('error', ex);

      throw ex;
    }
  }



}
