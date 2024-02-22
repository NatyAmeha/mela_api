import { PrismaClient } from "@prisma/client";
import { Access, Permission } from "../model/access.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { ErrorTypes } from "@app/common/errors/error_types";
import { find, includes, map, pull, remove } from "lodash";

export interface IAuthorizationRepo {
    addAccessToUser(userId: string, accesses: Access[]): Promise<Access[]>
    removeAccessFromUser(userId: string, accessId: string[]): Promise<boolean>
    addPermissionToAccess(userId: string, accessId: string, permissions: Permission[]): Promise<Permission[]>
    removePermissionsFromAccess(userId: string, accessId: string, permissionsId: string[]): Promise<boolean>
    getAccessByResourceId(resourceId: string): Promise<Access>
    // getUserGrantedAccess(userId: string): Promise<Access[]>
}

export class AuthorizationRepo extends PrismaClient implements IAuthorizationRepo {
    static injectName = "AUTHORIZATION_REPOSITORY"
    async addAccessToUser(userId: string, accesses: Access[]): Promise<Access[]> {
        return this.$transaction(async (tx) => {
            var createAccessResult = await tx.user.update({
                where: { id: userId },
                data: {
                    accesses: {
                        createMany: {
                            data: accesses.map(acc => { return { ...acc } }),
                        }
                    },
                },
                include: {
                    accesses: true
                }
            });
            var accessIds = createAccessResult.accesses.map(acc => acc.id)
            var update = await tx.user.update({
                where: { id: userId },
                data: { accessIds: { set: accessIds } },

            })
            return tx.access.findMany({ where: { id: accessIds[accessIds.length - 1] } })
        })

    }

    async removeAccessFromUser(userId: string, accessId: string[]): Promise<boolean> {
        try {
            var user = await this.user.findFirstOrThrow({ where: { id: userId }, include: { accesses: true } })
            var userAccessIds = map(user.accesses, access => access.id)
            var newAccessIds = pull(userAccessIds, ...accessId)
            var result = await this.user.update({
                where: { id: userId }, data: {
                    accessIds: newAccessIds,
                    accesses: {
                        deleteMany: {
                            id: { in: accessId }
                        }
                    }
                },
            })
            return true
        } catch (error) {
            return false
        }
    }

    async addPermissionToAccess(userId: string, accessId: string, permissions: Permission[]): Promise<Permission[]> {
        var result = await this.access.update({
            where: { id: accessId, userId: userId },
            data: {
                permissions: {
                    push: [...permissions]
                }
            }
        })
        return result.permissions as Permission[]
    }
    async removePermissionsFromAccess(userId: string, accessId: string, permissionsId: string[]): Promise<boolean> {
        var result = await this.access.update({
            where: { id: accessId, userId: userId },
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

    async getAccessByResourceId(resourceId: string): Promise<Access> {
        var accessResult = await this.access.findFirst({ where: { resourceId: resourceId } })
        if (!accessResult.id) {
            throw new RequestValidationException({ message: "Access not found with this resource id", errorType: ErrorTypes.ACCESS_NOT_FOUND })
        }
        return new Access({ ...accessResult })
    }

}