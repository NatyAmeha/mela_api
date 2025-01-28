import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { LoyaltyService } from "../usecase/loyalty.service";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { CustomerLoyaltyResponse } from "../model/loyalty.response";
import { CurrentUser } from "libs/common/get_user_decorator";
import { User } from "apps/auth/src/auth/model/user.model";
import { CustomerLoyalty } from "../model/customer_loyalty.model";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthzGuard } from "libs/common/authorization.guard";

@Resolver(of => CustomerLoyalty)
export class LoyaltyRewardResolver {
    constructor(private readonly loyaltyService: LoyaltyService) { }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.LOYALTY_REWARD, action: PERMISSIONACTION.CREATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ]
    })
    // @UseGuards(PermissionGuard)
    // @Mutation(returns => LoyaltyResponse)
    // async createRewards(@Args("businessId") businessId: string, @Args({ name: "rewards", type: () => [CreateRewardInput] }) rewards: CreateRewardInput[]): Promise<LoyaltyResponse> {
    //     let result = await this.loyaltyService.createRewards(businessId, rewards);
    //     return result;
    // }

    @Query(returns => CustomerLoyaltyResponse)
    @UseGuards(AuthzGuard)
    async getCustomerLoyalties(@CurrentUser() user?: User): Promise<CustomerLoyaltyResponse> {
        let result = await this.loyaltyService.getCustomerLoyalties(user?.id);
        return result;
    }




    @Query(returns => CustomerLoyaltyResponse)
    @UseGuards(AuthzGuard)
    async getCustomerBusinessLoyality(@Args("businessId") businessId: string, @CurrentUser() user?: User): Promise<CustomerLoyaltyResponse> {
        console.log("user id ", user?.id)
        let result = await this.loyaltyService.getBusinessRewards(businessId, user?.id);
        return result;
    }
}  