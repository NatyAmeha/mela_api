import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Membership } from "../model/memberhip.model";
import { PrismaClient } from '@prisma/client'
import { Group } from "../model/group.model";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IMembershipRepository {
    createMembershipPlan(membershipInfo: Membership, defaultGroups: Group[]): Promise<Membership>
    updateMembershipPlan(planId: string, membershipInfo: Partial<Membership>): Promise<boolean>
    getBusinessMembershipPlans(businessId: string): Promise<Membership[]>
    getMembershipPlan(planId: string): Promise<Membership>
    deleteMembershipPlan(planId: string): Promise<boolean>

    createGroup(groupInfo: Group): Promise<Group>
    getMembershipGroups(membershipId: string): Promise<Group[]>

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
            var createResult = await this.membership.create({
                data: {
                    ...resetMembershipInfo, groups: {
                        create: {
                            ...defaultGroups
                        }
                    }
                }
            })
            if (!createResult.id) {
                throw new PrismaException({ message: "Unable to create membership Plan", statusCode: 400 })
            }
            return new Membership({ ...createResult });
        } catch (ex) {
            throw new PrismaException({ message: " Unable to create membership plan", exception: ex })

        }
    }

    async updateMembershipPlan(planId: string, membershipInfo: Partial<Membership>): Promise<boolean> {
        try {
            const { groups, groupsId, subscriptions, subscriptionsId, ...resetMembershipInfo } = membershipInfo
            var updateResult = await this.membership.update({
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
            var result = await this.membership.findMany({ where: { owner: businessId } })
            return result.map(membership => new Membership({ ...membership }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership plans", exception: ex })
        }
    }

    async getMembershipPlan(planId: string): Promise<Membership> {
        try {
            var result = await this.membership.findUnique({ where: { id: planId } })
            return new Membership({ ...result })
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership plan", exception: ex })
        }
    }

    async deleteMembershipPlan(planId: string): Promise<boolean> {
        try {
            var result = await this.membership.delete({ where: { id: planId } })
            return result.id != undefined
        } catch (ex) {
            throw new PrismaException({ message: " Unable to delete membership plan", exception: ex })
        }
    }

    async createGroup(groupInfo: Group): Promise<Group> {
        try {
            const { members, membership, membershipId, ...resetGroupInfo } = groupInfo
            var createResult = await this.group.create({ data: resetGroupInfo })
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
            var result = await this.group.findMany({ where: { membershipId: membershipId } })
            return result.map(group => new Group({ ...group }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get membership groups", exception: ex })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}