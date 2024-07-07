import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import { of } from "rxjs"
import { Group, GroupMember } from "../model/group.model"
import { User } from "apps/auth/src/auth/model/user.model"

@Resolver(of => GroupMember)
export class GroupResolver {
    // ------ nested query for group ------
    @ResolveField('user', returns => User)
    async getProductsforBusiness(@Parent() member: GroupMember): Promise<User[]> {
        console.log("member", member)
        const user = new User({ id: member.userId, username: "test", email: "", firstName: "first name" })
        return await Promise.resolve([user])


        // return await this.productService.getBusinessProducts(business.id, {});
    }
}