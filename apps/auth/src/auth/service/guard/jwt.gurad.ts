import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlArgumentsHost, GqlExecutionContext, GraphQLModule } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        var ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req

    }
}

@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt-refresh") { }