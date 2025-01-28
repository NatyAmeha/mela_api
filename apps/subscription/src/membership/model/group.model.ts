import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { Membership } from "./memberhip.model";
import { Subscription } from "../../model/subscription.model";
import { User } from "apps/auth/src/auth/model/user.model";
import { PaymentMethod } from "../../model/payment_method";

export enum GroupMemberStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED',
    PENDING_RENEWAL = 'PENDING_RENEWAL'

}
@ObjectType()
@Directive('@shareable')
export class Group {
    @Field(type => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[];
    @Field(type => [GroupMember], { defaultValue: [] })
    members: GroupMember[]
    @Field(type => Boolean, { defaultValue: false })
    default: boolean
    @Field()
    membershipId?: string
    @Field(type => Membership)
    membership?: Membership
    constructor(data: Partial<Group>) {
        Object.assign(this, data)
    }

    static getDefaultGroupForMembership(membershipInfo: Membership) {
        return new Group({
            name: membershipInfo.name,
            members: [],
            default: true,
            membershipId: membershipInfo.id
        })
    }

    static getGroupIds(groups: Group[]) {
        return groups.map(group => group.id)

    }
}

@ObjectType()
@Directive('@shareable')
export class GroupMember {
    @Field()
    userId: string;
    @Field()
    phoneNumber: string;
    @Field(type => User)
    user?: User
    memberStatus: string
    activeSubscriptionId?: string
    @Field(type => Subscription)
    activeSubscription?: Subscription
    @Field(type => PaymentMethod)
    paymentMethod?: PaymentMethod
    dateJoined: Date;

    constructor(data: Partial<GroupMember>) {
        Object.assign(this, data)
    }

    static getGroupMembers({ userId, phoneNumber, memberStatus, activeSubscriptionId, paymentMethod }: { userId?: string[], phoneNumber?: string, memberStatus: GroupMemberStatus, activeSubscriptionId?: string, paymentMethod?: PaymentMethod }) {
        if (userId) {
            return userId.map(userId => new GroupMember({
                userId,
                phoneNumber,
                memberStatus: memberStatus,
                activeSubscriptionId: activeSubscriptionId,
                dateJoined: new Date(),
                paymentMethod: paymentMethod
            }))
        }
        return [new GroupMember({
            phoneNumber,
            memberStatus: memberStatus,
            activeSubscriptionId: activeSubscriptionId,
            dateJoined: new Date(),
            paymentMethod: paymentMethod
        })]
    }
}