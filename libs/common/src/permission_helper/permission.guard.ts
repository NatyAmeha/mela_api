import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { RequestValidationException } from "../errors/request_validation_exception";
import { User } from "apps/auth/src/auth/model/user.model";
import { Access, Permission } from "apps/auth/src/authorization/model/access.model";
import { BasePermissionHelper } from "./permission_helper";

@Injectable()
export class PermissionGuard implements CanActivate {
    static REQUIRED_PERMISSION = Symbol('REQUIRED_PERMISSION');
    constructor(private reflector: Reflector, @Inject(BasePermissionHelper.injectName) private permissionHelper: BasePermissionHelper) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        var gql = GqlExecutionContext.create(context);
        let gqlContext = gql.getContext();
        if (!gqlContext.req.headers.user || !gqlContext.req.headers.accesses) {
            return false
        }

        var userInfo = JSON.parse(gqlContext.req.headers.user as string) as User
        var permittedAccesses = JSON.parse(gqlContext.req.headers.accesses as string) as Access[]
        var requiredPermissions: Permission = this.reflector.get<Permission>(PermissionGuard.REQUIRED_PERMISSION, context.getHandler())
        if (!requiredPermissions) {
            throw new RequestValidationException({ message: "Bad request", statusCode: 400 })
        }
        var resourceTarget = gql.getArgs()?.id;
        if (resourceTarget) {
            requiredPermissions = new Permission({ ...requiredPermissions, resourceTarget: resourceTarget })
        }

        return this.permissionHelper.isPermissionsGranted(permittedAccesses, requiredPermissions!)
    }


}