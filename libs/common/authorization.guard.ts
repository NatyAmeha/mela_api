import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AccountType, User } from "apps/auth/src/auth/model/user.model";
import { Observable } from "rxjs";

export class AuthzGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gqlContext = GqlExecutionContext.create(context)
        var request = gqlContext.getContext().req;
        var userHeaderValue = request.headers.user ?? "";
        if (userHeaderValue && userHeaderValue !== "undefined") {
            var userInfo = JSON.parse(userHeaderValue) as User;
            if (userInfo.id != undefined) {
                return true
            }
            return false
        }
        return false;
    }
}
// Role Based Guard
export const Role = (accountType: AccountType) => SetMetadata<symbol, AccountType>(RoleGuard.REQUIRED_ROLE, accountType)
@Injectable()
export class RoleGuard implements CanActivate {
    static REQUIRED_ROLE = Symbol('REQUIRED_ROLE');
    constructor(private reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gqlContext = GqlExecutionContext.create(context)
        var request = gqlContext.getContext().req;
        var userHeaderValue = request.headers.user ?? "";
        let accountTypeResult = this.reflector.get<AccountType>(RoleGuard.REQUIRED_ROLE, context.getHandler());
        if (userHeaderValue && userHeaderValue !== "undefined") {
            var userInfo = JSON.parse(userHeaderValue) as User;
            if (userInfo.id != undefined && userInfo.accountType == accountTypeResult.toString()) {
                return true
            }
            return false
        }
        return false;
    }
}