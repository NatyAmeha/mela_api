import { CanActivate, ExecutionContext, Inject, Injectable, Scope, forwardRef } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { RequestValidationException } from "../errors/request_validation_exception";
import { User } from "apps/auth/src/auth/model/user.model";
import { Access, Permission } from "apps/auth/src/authorization/model/access.model";
import { BasePermissionHelper } from "./permission_helper";
import { PermissionCheckType, PermissionConfiguration, PermissionSelectionCriteria, RequestedPermissionInfo } from "./require_permission.decorator";
import { includes, some } from "lodash";

@Injectable()
export class PermissionGuard implements CanActivate {
    static PERMISSION_CONFIGURATION = Symbol('PERMISSION_CONFIGURATION');
    constructor(private reflector: Reflector, @Inject(forwardRef(() => BasePermissionHelper)) protected helper: BasePermissionHelper) {

    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        let gql = GqlExecutionContext.create(context);
        let gqlContext = gql.getContext();
        if (!gqlContext.req.headers.user || !gqlContext.req.headers.accesses) {
            return false;
        }

        // check authentication
        let userHeaderValue = gqlContext.req.headers.user as string
        if (!userHeaderValue || userHeaderValue == "undefined") {
            return false;
        }
        let userInfo = JSON.parse(userHeaderValue) as User;
        if (userInfo.id == undefined) {
            return false
        }


        let accesses = JSON.parse(gqlContext.req.headers.accesses as string) as Access[]
        const userRoles = accesses?.map(access => access.role)
        let requestedPermissionConfig: PermissionConfiguration = this.reflector.get<PermissionConfiguration>(PermissionGuard.PERMISSION_CONFIGURATION, context.getHandler())
        if (!requestedPermissionConfig) {
            throw new RequestValidationException({ message: "Access is not provided", statusCode: 400 })
        }
        const requestedRoles = requestedPermissionConfig.permissions?.map(permission => permission.role)

        const selectionCriteria = requestedPermissionConfig.selectionCriteria || PermissionSelectionCriteria.ANY
        const checkType = requestedPermissionConfig.checkType || PermissionCheckType.PERMISSION
        console.log('role check', selectionCriteria, requestedRoles, userRoles,)
        let isGrantedByRole = false;
        isGrantedByRole = selectionCriteria == PermissionSelectionCriteria.ANY ? requestedRoles.some(role => userRoles.includes(role)) : requestedRoles.every(role => userRoles.includes(role))

        let resourceTarget = this.helper.getResourceTargetFromArgument(gql);
        let requiredPermissionWithResourceTarget = this.helper.addResourceTargetOnRequestedPermissions(requestedPermissionConfig, resourceTarget);
        let permissions = accesses?.map(access => access.permissions).flat()
        const isPermissionGranted = this.helper.isPermissionsGranted(permissions, requiredPermissionWithResourceTarget);
        console.log('permission check', checkType, isGrantedByRole, isPermissionGranted)
        if (checkType == PermissionCheckType.ROLE) {
            return isGrantedByRole
        }

        else if (checkType == PermissionCheckType.ROLE_AND_PERMISSION) {
            return isGrantedByRole && isPermissionGranted
        }
        return isPermissionGranted



    }


}