import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Membership } from "../model/memberhip.model";
import { PrismaClient } from '@prisma/client'
import { Group } from "../model/group.model";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

export interface IMembershipRepository {
    createMembershipPlan(membershipInfo: Membership, defaultGroups: Group[]): Promise<Membership>
    updateMembershipPlan(planId: string, membershipInfo: Partial<Membership>): Promise<boolean>
    getBusinessMembershipPlans(businessId: string): Promise<Membership[]>
    getMembershipPlan(planId: string): Promise<Membership>
    deleteMembershipPlan(planId: string): Promise<boolean>

    createGroup(groupInfo: Group): Promise<Group>
    getMembershipGroups(membershipId: string): Promise<Group[]>

    assignProductstoMembershipPlan(planId: string, productIds: string[]): Promise<boolean>
    unassignProductsFromMembershipPlan(planId: string, productIds: string[]): Promise<boolean>

}

@Injectable()
export class MembershipRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IMembershipRepository {
    static injectName = "MEMBERSHIP_REPOSITORY"
    async onModuleInit() {
        await this.$connect();
    }

    async createMembershipPlan(membershipInfo: Membership, defaultGroups: Group[]): Promise<Membership> {
        try {
            const { groups, groupsId, subscriptions, subscriptionsId, ...resetMembershipInfo } = membershipInfo
            const createResult = await this.membership.create({
                data: {
                    ...resetMembershipInfo, groups: {
                        createMany: {
                            data: defaultGroups
                        }
                    }
                }
            })
            if (!createResult.id) {
                throw new PrismaException({ message: "Unable to create membership Plan", statusCode: 400 })
            }
            return new Membership({ ...createResult });
        } catch (ex) {
            console.log("error", ex)
            throw new PrismaException({ message: " Unable to create membership plan", exception: ex })

        }
    }

    async updateMembershipPlan(planId: string, membershipInfo: Partial<Membership>): Promise<boolean> {
        try {
            const { groups, groupsId, subscriptions, subscriptionsId, ...resetMembershipInfo } = membershipInfo
            const updateResult = await this.membership.update({
                where: { id: planId },
                data: resetMembershipInfo
            })
            return updateResult.id != undefined
        } catch (ex) {
            throw new PrismaException({ message: " Unable to update membership plan", exception: ex })
        }
    }

    async getBusinessMembershipPlans(businessId: string): Promise<Membership[]> {
        try {
            const result = await this.membership.findMany({ where: { owner: businessId } })
            return result.map(membership => new Membership({ ...membership }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership plans", exception: ex })
        }
    }

    async getMembershipPlan(planId: string): Promise<Membership> {
        try {
            const result = await this.membership.findUnique({ where: { id: planId }, include: { groups: true } })
            return new Membership({ ...result })
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership plan", exception: ex })
        }
    }

    async deleteMembershipPlan(planId: string): Promise<boolean> {
        try {
            const result = await this.membership.delete({ where: { id: planId } })
            return result.id != undefined
        } catch (ex) {
            throw new PrismaException({ message: " Unable to delete membership plan", exception: ex })
        }
    }

    async createGroup(groupInfo: Group): Promise<Group> {
        try {
            const { members, membership, membershipId, ...resetGroupInfo } = groupInfo
            const createResult = await this.group.create({ data: resetGroupInfo })
            if (!createResult.id) {
                throw new PrismaException({ message: "Unable to create group", statusCode: 400 })
            }
            return new Group({ ...createResult });
        } catch (ex) {
            throw new PrismaException({ message: " Unable to create group", exception: ex })
        }
    }

    async getMembershipGroups(membershipId: string): Promise<Group[]> {
        try {
            const result = await this.group.findMany({ where: { membershipId: membershipId } })
            return result.map(group => new Group({ ...group }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership groups", exception: ex })
        }
    }

    async assignProductstoMembershipPlan(planId: string, productIds: string[]): Promise<boolean> {
        try {
            const membershipInfo = await this.membership.findUnique({ where: { id: planId } })
            if (!membershipInfo) {
                throw new RequestValidationException({ message: "Membership plan not found", statusCode: 400 })
            }
            let existingProductIds = membershipInfo.membersProductIds || []
            let newProductIds = productIds.filter(productId => !existingProductIds.includes(productId))
            const result = await this.membership.update({
                where: { id: planId },
                data: {
                    membersProductIds: {
                        set: [...existingProductIds, ...newProductIds]
                    }
                }
            })
            return result.id != undefined
        } catch (ex) {
            throw new PrismaException({ message: " Unable to assign products to membership plan", exception: ex })
        }
    }

    async unassignProductsFromMembershipPlan(planId: string, productIds: string[]): Promise<boolean> {
        try {
            const membershipInfo = await this.membership.findUnique({ where: { id: planId } })
            if (!membershipInfo) {
                throw new RequestValidationException({ message: "Membership plan not found", statusCode: 400 })
            }
            let remainingProductIds = membershipInfo.membersProductIds?.filter(productId => !productIds.includes(productId))
            const result = await this.membership.update({
                where: { id: planId },
                data: {
                    membersProductIds: {
                        set: remainingProductIds
                    }
                }
            })
            return result.id != undefined
        } catch (ex) {
            throw new PrismaException({ message: " Unable to unassign products from membership plan", exception: ex })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}