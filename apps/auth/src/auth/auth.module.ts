import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.controller';
import { AuthService } from './auth.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: './apps/auth/schema.gql',
      sortSchema: true,
      playground: true,
    })
  ],
  controllers: [],
  providers: [AuthService, AuthResolver],
})
export class AuthModule { }
