import { CanActivate, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { Request } from "express";
import { Observable } from "rxjs";

export class AuthzGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gqlContext = GqlExecutionContext.create(context)
        var request = gqlContext.getContext().req;
        var userHeaderValue = request.headers.user ?? "";
        if (userHeaderValue !== "undefined") {
            var userInfo = JSON.parse(userHeaderValue) as User;
            if (userInfo.id != undefined) {
                return true
            }
            return false
        }
        return false;
    }
}  