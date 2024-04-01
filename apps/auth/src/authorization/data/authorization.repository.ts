import { Access, Permission } from "../model/access.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ErrorTypes } from "@app/common/errors/error_types";
import { find, includes, map, pull, remove } from "lodash";
import { PrismaClient } from "apps/auth/prisma/generated/prisma_auth_client";
import { AccessResponse } from "../model/acces.response";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IAuthorizationRepo {
    addPermissionAccess(accesses: Access[]): Promise<AccessResponse>;
    removeAccess(accessId: string): Promise<AccessResponse>
    addPermissionToAccess(accessId: string, permissions: Permission[]): Promise<Permission[]>
    removePermissionsFromAccess(accessId: string, permissionsId: string[]): Promise<boolean>
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
            var accesssResult = txResult.map(access => new Access({ ...access }));
            return {
                success: true,
                accesses: accesssResult
            }
        } catch (error) {
            console.log("error", error)
            return {
                success: false,
                message: error.message,
                code: 400
            }
        }

    }

    async removeAccess(accessId: string): Promise<AccessResponse> {
        try {
            var access = await this.access.findFirst({ where: { id: accessId }, include: { permissions: true } })
            if (!access) {
                return {
                    success: false,
                    message: "Access not found with this id"
                }
            }
            var result = await this.access.delete({ where: { id: accessId } })
            return {
                success: true,
                accesses: [new Access({ ...access })]
            }
        } catch (error) {
            throw new PrismaException({ source: "Remove Access", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async addPermissionToAccess(accessId: string, permissions: Permission[]): Promise<Permission[]> {
        var result = await this.access.update({
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
        var result = await this.access.update({
            where: { id: accessId },
            data: {
                permissions: {
                    deleteMany: {
                        where: { id: { in: permissionsId } }
                    }
                }
            }
        })
        var ress = result.permissions as Permission[]
        return true;
    }


}