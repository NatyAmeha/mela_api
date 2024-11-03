import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { of } from "rxjs";
import { Reward } from "./model/reward.model";
import { LoyaltyService } from "./loyalty.service";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { UseGuards } from "@nestjs/common";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { LoyaltyResponse } from "./model/loyalty.response";
import { CreateRewardInput } from "./dto/reward.input";
import { AuthzGuard } from "libs/common/authorization.guard";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { CustomerLoyalty } from "./model/customer_loyalty.model";

@Resolver(of => CustomerLoyalty)
export class LoyaltyRewardResolver {
    constructor(private readonly loyaltyService: LoyaltyService) { }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.LOYALTY_REWARD, action: PERMISSIONACTION.CREATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ]
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => LoyaltyResponse)
    async createRewards(@Args("businessId") businessId: string, @Args({ name: "rewards", type: () => [CreateRewardInput] }) rewards: CreateRewardInput[]): Promise<LoyaltyResponse> {
        let result = await this.loyaltyService.createRewards(businessId, rewards);
        return result;
    }

    @Query(returns => LoyaltyResponse)
    async getCustomerLoyalties(@CurrentUser() user?: User): Promise<LoyaltyResponse> {
        let result = await this.loyaltyService.getCustomerLoyalties(user?.id);
        return result;
    }




    @Query(returns => LoyaltyResponse)
    async getCustomerBusinessLoyality(@Args("businessId") businessId: string, @CurrentUser() user?: User): Promise<LoyaltyResponse> {
        let result = await this.loyaltyService.getBusinessRewards(businessId, user?.id);
        return result;
    }

    @ResolveField(returns => [Reward])
    async businessRewards(@Parent() customerLoyalty: CustomerLoyalty) {
        let result = await this.loyaltyService.getBusinessRewards(customerLoyalty.businessId, customerLoyalty.customerId);
        return result.rewards;;
    }
}  