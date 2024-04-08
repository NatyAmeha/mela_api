import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { RequestValidationException } from "../errors/request_validation_exception";
import { User } from "apps/auth/src/auth/model/user.model";
import { Access, Permission } from "apps/auth/src/authorization/model/access.model";
import { BasePermissionHelper } from "./permission_helper";
import { PermissionConfiguration, RequestedPermissionInfo } from "./require_permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
    static PERMISSION_CONFIGURATION = Symbol('PERMISSION_CONFIGURATION');
    constructor(private reflector: Reflector, private permissionHelper: BasePermissionHelper) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        let gql = GqlExecutionContext.create(context);
        let gqlContext = gql.getContext();
        if (!gqlContext.req.headers.user || !gqlContext.req.headers.accesses) {
            return false
        }

        let userInfo = JSON.parse(gqlContext.req.headers.user as string) as User
        let permittedAccesses = JSON.parse(gqlContext.req.headers.accesses as string) as Access[]

        let requestedPermissionConfig: PermissionConfiguration = this.reflector.get<PermissionConfiguration>(PermissionGuard.PERMISSION_CONFIGURATION, context.getHandler())

        if (!requestedPermissionConfig) {
            throw new RequestValidationException({ message: "Access is not provided", statusCode: 400 })
        }
        let resourceTarget = this.permissionHelper.getResourceTargetFromArgument(gql);
        let requiredPermissionWithResourceTarget = this.permissionHelper.addResourceTargetOnRequestedPermissions(requestedPermissionConfig, resourceTarget);

        return this.permissionHelper.isPermissionsGranted(permittedAccesses, requiredPermissionWithResourceTarget)
    }


}