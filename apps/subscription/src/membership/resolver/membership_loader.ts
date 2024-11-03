import { Scope } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import DataLoader from "dataloader";
import { MembershipService } from "./membership.service";

@Injectable({ scope: Scope.REQUEST })
export class MembershipLoader {
    constructor(private readonly membershipService: MembershipService) { }

    public readonly loader = new DataLoader(async (keys: Array<{ membershipIds: string[] }>) => {
        const memberships = await this.membershipService.getBatchMemberships(keys);
        return keys.map(key => {
            return memberships.filter(membership => key.membershipIds.includes(membership.id));
        });
    });
}