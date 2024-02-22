import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { RequestValidationException } from "../errors/request_validation_exception";
import { Permission } from "@prisma/client";
import { isPermissionsGranted } from "./permission_util";
import { User } from "apps/auth/src/auth/model/user.model";

@Injectable()
export class PermissionGuard implements CanActivate {
    static REQUIRED_PERMISSION = Symbol('REQUIRED_PERMISSION');
    constructor(private reflector: Reflector) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gql = GqlExecutionContext.create(context);
        var user = gql.getContext().req.user;
        if (!user.accesses) {
            throw new RequestValidationException({ message: "UnAuthorized Exception", statusCode: 401 })
        }
        var currentUser = user as User;
        var requiredPermissions = this.reflector.get<Permission>(PermissionGuard.REQUIRED_PERMISSION, context.getHandler())

        if (!requiredPermissions) {
            throw new RequestValidationException({ message: "Bad request", statusCode: 400 })
        }
        return isPermissionsGranted(currentUser.accesses!, requiredPermissions!)
    }


}