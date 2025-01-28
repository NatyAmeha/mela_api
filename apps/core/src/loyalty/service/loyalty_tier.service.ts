import { Inject, Injectable } from "@nestjs/common";
import { ILoyaltyTierRepository, LoyaltyTierRepository } from "../repo/loyalty_tier.repository";
import { CreateLoyaltyTierInput } from "../dto/create-loyalty-tier.input";
import { LoyaltyResponse } from "../model/loyalty.response";
import { CreateRewardInput } from "../dto/reward.input";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

@Injectable()
export class LoyaltyTierService {
    constructor(
        @Inject(LoyaltyTierRepository.injectName) private loyaltyTierRepo: ILoyaltyTierRepository
    ) { }

    async createLoyaltyTier(input: CreateLoyaltyTierInput): Promise<LoyaltyResponse> {
        try {
            const tier = await this.loyaltyTierRepo.createLoyaltyTier(input);
            return new LoyaltyResponse({
                success: true,
                message: "Loyalty tier created successfully",
                tier: tier
            });
        } catch (error) {
            return new LoyaltyResponse({
                success: false,
                message: error.message
            });
        }
    }

    async addRewardToTier(tierId: string, inputs: CreateRewardInput[]): Promise<LoyaltyResponse> {
        try {
            const tier = await this.loyaltyTierRepo.addReward(tierId, inputs);
            return new LoyaltyResponse({
                success: true,
                message: "Reward added to tier successfully",
                tier: tier
            });
        } catch (error) {
            return new LoyaltyResponse({
                success: false,
                message: error.message
            });
        }
    }

    async removeRewardFromTier(tierId: string, rewardIds: string[]): Promise<LoyaltyResponse> {
        try {
            const tier = await this.loyaltyTierRepo.removeReward(tierId, rewardIds);
            return new LoyaltyResponse({
                success: true,
                message: "Reward removed from tier successfully",
                tier: tier
            });
        } catch (error) {
            return new LoyaltyResponse({
                success: false,
                message: error.message
            });
        }
    }

    async getBusinessLoyaltyTiers(businessId: string): Promise<LoyaltyResponse> {
        try {
            const tiers = await this.loyaltyTierRepo.findByBusinessId([businessId]);
            return new LoyaltyResponse({
                success: true,
                message: "Business loyalty tiers retrieved successfully",
                tiers: tiers
            });
        } catch (error) {
            return new LoyaltyResponse({
                success: false,
                message: error.message
            });
        }
    }

    async getBusinessLoyaltyTier(businessId: string, tierId: string): Promise<LoyaltyResponse> {
        try {
            const tier = await this.loyaltyTierRepo.findById(tierId);
            return new LoyaltyResponse({
                success: true,
                message: "Business loyalty tier retrieved successfully",
                tier: tier
            });
        } catch (error) {
            return new LoyaltyResponse({
                success: false,
                message: error.message
            });
        }
    }

    async getCustomerLoyaltyTiers(points: number, businessIds: string[]): Promise<LoyaltyResponse> {
        try {
            const tiers = await this.loyaltyTierRepo.findTiersByCustomerPoints(points, businessIds);
            return new LoyaltyResponse({
                success: true,
                message: "Customer loyalty tiers retrieved successfully",
                tiers: tiers
            });
        } catch (error) {
            if (error instanceof RequestValidationException) {
                return new LoyaltyResponse({
                    success: false,
                    message: error.message
                });
            }
            throw error;
        }
    }
} 