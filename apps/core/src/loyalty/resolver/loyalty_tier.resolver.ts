import { Args, Float, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { LoyaltyTierService } from '../service/loyalty_tier.service';
import { LoyaltyTier } from '../model/loyalty_tier.model';
import { CreateLoyaltyTierInput } from '../dto/create-loyalty-tier.input';
import { CreateRewardInput } from '../dto/reward.input';
import { LoyaltyResponse } from '../model/loyalty.response';

import { RequiresPermission } from '@app/common/permission_helper/require_permission.decorator';
import { AppResources } from 'apps/mela_api/src/const/app_resource.constant';
import { UseGuards } from '@nestjs/common';
import { PermissionGuard } from '@app/common/permission_helper/permission.guard';
import { PERMISSIONACTION } from '@app/common/permission_helper/permission_constants';
import { Business } from '../../business/model/business.model';
import { RewardBusinessLoader } from '../data_loader/reward.data_loader';

@Resolver(() => LoyaltyTier)
export class LoyaltyTierResolver {
    constructor(
        private readonly loyaltyTierService: LoyaltyTierService,
        private readonly businessLoader: RewardBusinessLoader,
    ) { }

    @Mutation(() => LoyaltyResponse)
    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    async createLoyaltyTier(@Args('businessId') businessId: string, @Args('input') input: CreateLoyaltyTierInput): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.createLoyaltyTier(input);
    }

    @Mutation(() => LoyaltyResponse)
    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" },
            { resourceType: AppResources.LOYALTY_TIER, action: PERMISSIONACTION.ANY, resourcTargetName: "tierId" }
        ],
    })
    @UseGuards(PermissionGuard)
    async addRewardToTier(@Args('businessId') businessId: string, @Args('tierId') tierId: string, @Args({ name: 'inputs', type: () => [CreateRewardInput] }) inputs: CreateRewardInput[]): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.addRewardToTier(tierId, inputs);
    }

    @Mutation(() => LoyaltyResponse)
    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" },
            { resourceType: AppResources.LOYALTY_TIER, action: PERMISSIONACTION.ANY, resourcTargetName: "tierId" }
        ],
    })
    @UseGuards(PermissionGuard)
    async removeRewardFromTier(@Args('tierId') tierId: string, @Args({ name: 'rewardIds', type: () => [String] }) rewardIds: string[]): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.removeRewardFromTier(tierId, rewardIds);
    }

    @Query(() => LoyaltyResponse)
    async getBusinessLoyaltyTiers(@Args('businessId') businessId: string): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.getBusinessLoyaltyTiers(businessId);
    }

    @Query(() => LoyaltyResponse)
    async getBusinessLoyaltyTier(@Args('businessId') businessId: string, @Args('tierId') tierId: string): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.getBusinessLoyaltyTier(businessId, tierId);
    }

    @Query(() => LoyaltyResponse, { description: "Get loyalty tiers based on customer points. Returns tiers where customer points meet or exceed the minimum points requirement." })
    async getCustomerEligibleTiers(@Args('businessId') businessId: string, @Args('points', { type: () => Float }) points: number): Promise<LoyaltyResponse> {
        return this.loyaltyTierService.getCustomerLoyaltyTiers(points, [businessId]);
    }

    @ResolveField("businesses", () => [Business], { nullable: true })
    async businesses(@Parent() loyaltyTier: LoyaltyTier): Promise<Business[]> {
        if (!loyaltyTier.businessIds?.length) {
            return [];
        }
        return await Promise.all(
            loyaltyTier.businessIds.map(id => this.businessLoader.load(id))
        );
    }
} 