import { Inject } from "@nestjs/common";
import { IMembershipRepository, MembershipRepository } from "../repo/membership.repo";
import { CreateMembershipInput } from "../dto/membership.input";
import { Membership } from "../model/memberhip.model";
import { Group } from "../model/group.model";
import { MembershipResponseBuilder } from "../dto/membership.response";

export class MembershipService {
    constructor(@Inject(MembershipRepository.injectName) private membershipRepo: IMembershipRepository) {

    }


    async createMembershipPlan(businessId: string, input: CreateMembershipInput) {
        const membershipInfo = Membership.fromCreateMembershipPlanInput(input, businessId)
        const defaultGroup = Group.getDefaultGroupForMembership(membershipInfo)
        const result = await this.membershipRepo.createMembershipPlan(membershipInfo, [defaultGroup])
        return new MembershipResponseBuilder().withMembership(result).build();
    }


}