import { CanActivate, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Request } from "express";
import { Observable } from "rxjs";

export class UserAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gqlContext = GqlExecutionContext.create(context)
        var request = gqlContext.getContext().req;
        var userInfo = request.headers.user
        if (userInfo) {
            request.user = userInfo;
            return true
        }
        return false;
    }
} 