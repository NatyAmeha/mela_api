import { Access, AccessOwnerType, Permission } from "../model/access.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ErrorTypes } from "@app/common/errors/error_types";
import { find, includes, map, pull, remove } from "lodash";
import { PrismaClient } from "apps/auth/prisma/generated/prisma_auth_client";
import { AccessResponse, AccessResponseBuilder } from "../model/acces.response";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IAuthorizationRepo {
    addPermissionAccess(accesses: Access[]): Promise<AccessResponse>;
    removeAccess(accessId: string): Promise<AccessResponse>
    addPermissionToAccess(accessId: string, permissions: Permission[]): Promise<Permission[]>
    removePermissionsFromAccess(accessId: string, permissionsId: string[]): Promise<boolean>
    getUserAllAccesses(userId: string): Promise<Access[]>
    getBusinessAllAccesses(businessId: string): Promise<Access[]>
}

export class AuthorizationRepo extends PrismaClient implements IAuthorizationRepo {
    static injectName = "AUTHORIZATION_REPOSITORY"


    async addPermissionAccess(accesses: Access[]): Promise<AccessResponse> {
        try {
            let txResult = await this.$transaction(async (tx) => {
                let result = await Promise.all(accesses.map(async (access) => {
                    let createdAccess = await tx.access.create({ data: access });
                    return createdAccess;
                }));
                return result;
            })
            let accesssResult = txResult.map(access => new Access({ ...access }));
            return new AccessResponseBuilder().withAccesses(accesssResult).build();
        } catch (error) {
            console.log("error", error)
            return new AccessResponseBuilder().withError(error.message, 400);
        }
    }

    async removeAccess(accessId: string): Promise<AccessResponse> {
        try {
            let access = await this.access.findFirst({ where: { id: accessId }, include: { permissions: true } })
            if (!access) {
                return new AccessResponseBuilder().withError("Access not found with this id")
            }
            await this.access.delete({ where: { id: accessId } })
            var accessResult = new Access({ ...access })
            return new AccessResponseBuilder().withAccesses([accessResult]).build()
        } catch (error) {
            throw new PrismaException({ source: "Remove Access", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async addPermissionToAccess(accessId: string, permissions: Permission[]): Promise<Permission[]> {
        let result = await this.access.update({
            where: { id: accessId },
            data: {
                permissions: {
                    push: [...permissions]
                }
            }
        })
        return result.permissions as Permission[]
    }
    async removePermissionsFromAccess(accessId: string, permissionsId: string[]): Promise<boolean> {
        let result = await this.access.update({
            where: { id: accessId },
            data: {
                permissions: {
                    deleteMany: {
                        where: { id: { in: permissionsId } }
                    }
                }
            }
        })
        let ress = result.permissions as Permission[]
        return true;
    }

    async getUserAllAccesses(userId: string): Promise<Access[]> {
        try {
            let accesses = await this.access.findMany({ where: { ownerType: AccessOwnerType.USER.toString(), owner: userId } })
            return accesses.map(access => new Access({ ...access }))
        } catch (ex) {
            throw new PrismaException({ source: "Get User All Accesses", statusCode: 400, code: ex.code, meta: { message: ex.meta.message ?? ex.meta.cause } })
        }
    }

    async getBusinessAllAccesses(businessId: string): Promise<Access[]> {
        try {
            let accesses = await this.access.findMany({ where: { ownerType: AccessOwnerType.BUSINESS.toString(), owner: businessId }, include: { permissions: true } })
            return accesses.map(access => new Access({ ...access }))
        } catch (error) {
            throw new PrismaException({ source: "Get Business All Accesses", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }


}