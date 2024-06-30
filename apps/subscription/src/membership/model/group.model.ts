import { LocalizedField } from "@app/common/model/localized_model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Membership } from "./memberhip.model";

export enum GroupMemberStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'

}
@ObjectType()
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
            membership: membershipInfo,
            members: [],
            default: true
        })
    }
}

@ObjectType()
export class GroupMember {
    userId: string;
    memberStatus: string
    dateJoined: Date;

    constructor(data: Partial<GroupMember>) {
        Object.assign(this, data)
    }
}