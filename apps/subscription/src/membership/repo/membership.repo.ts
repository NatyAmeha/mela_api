import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Membership } from "../model/memberhip.model";
import { PrismaClient } from '@prisma/client'
import { Group, GroupMember, GroupMemberStatus } from "../model/group.model";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { keyBy, result, uniq, uniqBy, update } from "lodash";
import { Subscription } from "../../model/subscription.model";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";

export interface IMembershipRepository {
    createMembershipPlan(membershipInfo: Membership, defaultGroups: Group[]): Promise<Membership>
    updateMembershipPlan(planId: string, membershipInfo: Partial<Membership>): Promise<boolean>
    getBusinessMembershipPlans(businessId: string): Promise<Membership[]>
    getMembershipPlan(planId: string): Promise<Membership>
    getMembershipPlans(membershipIds: string[]): Promise<Membership[]>
    deleteMembershipPlan(planId: string): Promise<boolean>

    createGroup(groupInfo: Group): Promise<Group>
    getMembershipGroups(membershipId: string): Promise<Group[]>
    getMembershipSelectedGroups(membershipId: string, groupsIds: string[]): Promise<Group[]>

    assignProductstoMembershipPlan(planId: string, productIds: string[]): Promise<boolean>
    unassignProductsFromMembershipPlan(planId: string, productIds: string[]): Promise<boolean>

    getDefaultGroupsForMembership(membershipId: string): Promise<Group[]>
    joinGroups(groupIds: string[], membersInfo: GroupMember[]): Promise<boolean>
    leaveGroups(groupIds: string[], userIds: string[]): Promise<boolean>
    updateGroupMembersInfos(groupIds: string[], membersInfo: GroupMember[]): Promise<boolean>

    approveUserMembershipRequest(membershipId: string, userIds: string[], subscriptionInfo: Subscription): Promise<boolean>

    getUserMemberships(userId: string): Promise<Membership[]>

    getAllMembershipMembers(membershipId: string): Promise<GroupMember[]>


    // Discovery
    getPopularMemberships(queryHelper: QueryHelper<Membership>): Promise<Membership[]>



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
            if (!result) {
                throw new RequestValidationException({ message: "Membership plan not found", statusCode: 400 })
            }
            return new Membership({ ...result })
        } catch (ex) {
            console.log("error", ex);
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ message: " Unable to get membership plan", exception: ex })
        }
    }

    async getMembershipPlans(membershipIds: string[]): Promise<Membership[]> {
        const result = await this.membership.findMany({ where: { id: { in: membershipIds } } })
        return result.map(membership => new Membership({ ...membership }))
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

    async getMembershipSelectedGroups(membershipId: string, groupsIds: string[]): Promise<Group[]> {
        try {
            const result = await this.group.findMany({ where: { membershipId: membershipId, id: { in: groupsIds } } })
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

    async getDefaultGroupsForMembership(membershipId: string): Promise<Group[]> {
        try {
            const defaultGroups = await this.group.findMany({ where: { membershipId, default: true } })
            return defaultGroups.map(group => new Group({ ...group }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get default groups for membership", exception: ex })
        }
    }

    async joinGroups(groupIds: string[], membersInfo: GroupMember[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const result = await Promise.all(groupIds.map(async groupId => {
                    const groupResult = await prisma.group.findUnique({ where: { id: groupId } })
                    if (groupResult) {
                        const uniqMembers = uniqBy([...groupResult.members, ...membersInfo], (member) => member.userId)
                        return prisma.group.update({
                            where: { id: groupId },
                            data: {
                                members: {
                                    set: uniqMembers
                                }
                            }
                        })
                    }
                }))
                return result;
            });
            return true
        } catch (ex) {
            console.log("error", ex);
            throw new PrismaException({ message: " Unable to join groups", exception: ex })
        }
    }

    async leaveGroups(groupIds: string[], userIds: string[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const result = await Promise.all(groupIds.map(async groupId => {
                    const groupResult = await prisma.group.findUnique({ where: { id: groupId } })
                    if (groupResult) {
                        const remainingMembers = groupResult.members.filter(member => !userIds.includes(member.userId))
                        return await prisma.group.update({
                            where: { id: groupId },
                            data: {
                                members: {
                                    set: remainingMembers
                                }
                            }
                        })
                    }
                })
                )
                return result;
            });
            return true
        } catch (ex) {
            console.log("error", ex);
            throw new PrismaException({ message: " Unable to leave groups", exception: ex })
        }
    }

    async updateGroupMembersInfos(groupIds: string[], membersInfo: GroupMember[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const result = await Promise.all(groupIds.map(async groupId => {
                    const groupResult = await prisma.group.findUnique({ where: { id: groupId } })
                    if (groupResult) {
                        const updatedMembers = groupResult.members.map(member => {
                            const updatedMemberInfo = membersInfo.find(m => m.userId == member.userId)
                            if (updatedMemberInfo) {
                                return { ...member, ...updatedMemberInfo }
                            }
                            return member
                        })
                        await prisma.group.update({
                            where: { id: groupId },
                            data: {
                                members: {
                                    set: updatedMembers
                                }
                            }
                        })
                        return true;
                    }
                    return false;
                })
                )
                return result;
            });
            return true;
        } catch (ex) {
            console.log("error", ex);
            throw new PrismaException({ message: " Unable to update group members info", exception: ex })
        }
    }

    async approveUserMembershipRequest(membershipId: string, userIds: string[], subscriptionInfo: Subscription): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const { plan, subscriptioinPlanId, ...resetSubscriptionInfo } = subscriptionInfo
                const subscriptionCreateResult = await prisma.subscription.create({ data: { ...resetSubscriptionInfo } });
                if (!subscriptionCreateResult.id) {
                    throw new PrismaException({ message: "Unable to create subscription", statusCode: 500 })
                }
                const groupResult = await prisma.group.findMany({ where: { membershipId: membershipId } })
                if (groupResult) {
                    const groupIds = groupResult.map(group => group.id)
                    const membersInfo = GroupMember.getGroupMembers(userIds, GroupMemberStatus.ACTIVE, subscriptionCreateResult.id)
                    const groupJoinResult = await this.updateGroupMembersInfos(groupIds, membersInfo)
                    return groupJoinResult
                }

                return false;
            });
            return true
        } catch (ex) {
            console.log("error", ex);
            throw new PrismaException({ message: " Unable to approve user membership request", exception: ex })
        }
    }

    async getPopularMemberships(queryHelper: QueryHelper<Membership>): Promise<Membership[]> {
        try {
            const popularMembershipResult = await this.membership.findMany({
                where: { ...queryHelper.query as any },
                orderBy: { ...queryHelper.orderBy as any },
                skip: queryHelper?.page ? ((queryHelper.page - 1) * queryHelper.limit) : 0,
                take: queryHelper?.limit,
            })
            return popularMembershipResult.map(membership => new Membership({ ...membership }))
        } catch (ex) {
            throw new PrismaException({ message: " Unable to get popular memberships", exception: ex })

        }
    }

    async getAllMembershipMembers(membershipId: string): Promise<GroupMember[]> {
        const userGroups = await this.group.findMany({ where: { membershipId } })
        const allMembers = userGroups.map(group => group.members).flat()
        const uniqueMembers = uniq(allMembers) as GroupMember[]
        const groupMembers = uniqueMembers.map(member => new GroupMember({ ...member }))
        const activeSubscription = await this.subscription.findMany({ where: { id: { in: groupMembers.map(member => member.activeSubscriptionId) } } })
        const subscriptionMap = keyBy(activeSubscription, 'id')
        groupMembers?.forEach(member => {
            member.activeSubscription = new Subscription({ ...subscriptionMap[member.activeSubscriptionId] })
        })
        return groupMembers;
    }

    async getUserMemberships(userId: string): Promise<Membership[]> {
        const userGroups = await this.group.findMany({ where: { members: { some: { userId } } } })
        const membershipIds = uniq(userGroups.map(group => group.membershipId))
        const memberships = await this.membership.findMany({ where: { id: { in: membershipIds } } })
        return memberships.map(membership => new Membership({ ...membership }))
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }
}