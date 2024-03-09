import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { RmqModule } from 'libs/rmq/rmq_module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      server: {
        context: (({ req }) => {
          return {
            authorization: req?.headers?.authorization
          }
        })
      },
      gateway: {
        buildService: (definition) => {
          return new RemoteGraphQLDataSource({
            url: definition.url,
            willSendRequest: (({ request, context }) => {
              request.http.headers.set("authorization", context.authorization)
            })
          })
        },
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: "subscription_service", url: "http://localhost:3001/graphql" },
            { name: "auth_service", url: "http://localhost:3002/graphql" }
          ]
        })
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
