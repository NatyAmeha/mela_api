import { Module, UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { RmqModule } from 'libs/rmq/rmq_module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ModuleRef } from '@nestjs/core';
import axios, { Axios } from 'axios';
import { GraphQLError } from 'graphql';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from '../../../libs/common/src/model/gateway_user.model';
import { ConfigModule } from '@nestjs/config';
import { Configuration } from 'apps/mela_api/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [Configuration],
    }),
    HttpModule,
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: async () => {
        var appService = new AppService()
        return {
          server: {
            context: async ({ req, }) => {
              // console.log(httpService.axiosRef)
              return {
                authorization: req?.headers?.authorization,
              }
            },
          },
          gateway: {
            buildService: (definition) => {
              return new RemoteGraphQLDataSource({
                url: definition.url,
                willSendRequest: (async ({ request, context }) => {
                  var user = await appService.validateJwtAndQueryUser(context.authorization)
                  request.http.headers.set("authorization", context.authorization)
                  request.http.headers.set("user", JSON.stringify(user));
                }),

              })
            },
            // var dockerendpoint = "http://host.docker.internal:3001"
            supergraphSdl: new IntrospectAndCompose({
              subgraphs: [
                { name: "subscription_service", url: "http://localhost:3001/graphql" },
                { name: "auth_service", url: "http://localhost:3002/graphql" }
              ]
            }),

          }
        }
      },
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
