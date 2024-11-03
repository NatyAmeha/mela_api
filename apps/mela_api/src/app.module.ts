import { Module, UnauthorizedException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { ApolloGateway, GatewayConfig, IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { RmqModule } from 'libs/rmq/rmq_module';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ModuleRef } from '@nestjs/core';
import axios, { Axios } from 'axios';
import { GraphQLError, printSchema } from 'graphql';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from '../../../libs/common/src/model/gateway_user.model';
import { ConfigModule } from '@nestjs/config';
import { Configuration } from 'apps/mela_api/configuration';
import * as fs from 'fs';
import * as path from 'path';



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
        var dockerendpoint = "http://host.docker.internal:"
        var appService = new AppService()
        const gateway: GatewayConfig = {

          buildService: (definition) => {
            return new RemoteGraphQLDataSource({
              url: definition.url,
              willSendRequest: (async ({ request, context }) => {
                var bypassToken = context.token?.toLowerCase() == "true" ? true : false
                console.log("context", bypassToken);
                var userResponse = await appService.validateJwtAndQueryUser(context.authorization, bypassToken)
                if (userResponse != undefined) {
                  request.http.headers.set("authorization", context.authorization)
                  request.http.headers.set("user", JSON.stringify(userResponse.user));
                  request.http.headers.set("accesses", JSON.stringify(userResponse.accesses));
                }
              }),

            })
          },

          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              { name: "subscription_service", url: `${dockerendpoint}3001/graphql` },
              { name: "auth_service", url: `${dockerendpoint}3002/graphql` },
              { name: "core_service", url: `${dockerendpoint}3003/graphql` },
              { name: "order_service", url: `${dockerendpoint}3004/graphql` },
            ]

          }),
        }


        const gatewaydata = new ApolloGateway({
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              { name: "subscription_service", url: `${dockerendpoint}3001/graphql` },
              { name: "auth_service", url: `${dockerendpoint}3002/graphql` },
              { name: "core_service", url: `${dockerendpoint}3003/graphql` },
              { name: "order_service", url: `${dockerendpoint}3004/graphql` },
            ],
          }),
        });

        const schema = gatewaydata.load().then((result) => {
          const schemaString = printSchema(result.schema);
          const filePath = path.join(__dirname, '..', 'schema.gql');
          console.log('Composed Schema SDL:', filePath);
          fs.writeFileSync(filePath, schemaString);

        });


        // const { schema } = new ApolloGateway(gateway)
        // console.log('Composed Schema SDL:', printSchema(schema));
        return {

          server: {
            context: async ({ req, }) => {
              return {
                authorization: req?.headers?.authorization,
                token: req?.headers?.token,
              }
            },
            sortSchema: true,
            autoSchemaFile: {
              federation: 2,
              path: './apps/mela_api/schema.gql'
            },

          },

          gateway: gateway,

        }
      },
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
