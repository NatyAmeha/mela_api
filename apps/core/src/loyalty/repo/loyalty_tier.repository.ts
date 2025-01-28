import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

import { LoyaltyTier } from '../model/loyalty_tier.model';
import { LocalizedField } from "@app/common/model/localized_model";
import { CreateRewardInput } from "../dto/reward.input";
import { CreateLoyaltyTierInput } from "../dto/create-loyalty-tier.input";


export interface ILoyaltyTierRepository {
    createLoyaltyTier(input: CreateLoyaltyTierInput, { transactionClient }?: { transactionClient?: PrismaClient }): Promise<LoyaltyTier>;
    findById(id: string): Promise<LoyaltyTier>;
    findByBusinessId(businessIds: string[]): Promise<LoyaltyTier[]>;
    findTiersByCustomerPoints(points: number, businessIds: string[]): Promise<LoyaltyTier[]>;
    addReward(tierId: string, rewardInput: CreateRewardInput[], { transactionClient }?: { transactionClient?: PrismaClient }): Promise<LoyaltyTier>;
    removeReward(tierId: string, rewardIds: string[], { transactionClient }?: { transactionClient?: PrismaClient }): Promise<LoyaltyTier>;
}

@Injectable()
export class LoyaltyTierRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ILoyaltyTierRepository {
    static injectName = 'LOYALTY_TIER_REPOSITORY';

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    async createLoyaltyTier(input: CreateLoyaltyTierInput, { transactionClient }: { transactionClient?: PrismaClient } = {}): Promise<LoyaltyTier> {
        try {
            const tierData = await (transactionClient ?? this).loyaltyTier.create({
                data: {
                    name: input.name?.map(n => new LocalizedField(n)),
                    description: input.description?.map(d => new LocalizedField(d)),
                    minPoints: input.minimumPoints,
                    rewards: input.rewards?.map(r => {
                        return {
                            name: r.name?.map(n => new LocalizedField(n)),
                            description: r.description?.map(d => new LocalizedField(d)),
                            businessIds: r.businessIds,
                            minPointsToRedeem: r.minPointsToRedeem,
                            rewardTypes: r.rewardTypes,
                            rewardInfo: r.rewardInfo?.map(info => info.toRewardInfo())
                        }
                    }),
                    businessIds: input.businessIds,
                    productIds: input.productIds,
                },
            });
            return new LoyaltyTier({ ...tierData });
        } catch (ex) {
            console.log(ex);
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta });
        }
    }

    async findById(id: string): Promise<LoyaltyTier> {
        try {
            const tier = await this.loyaltyTier.findUnique({ where: { id } });
            if (!tier) {
                throw new RequestValidationException({ message: "Loyalty tier not found" });
            }
            return new LoyaltyTier({ ...tier });
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error
            }
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta });
        }
    }

    async findByBusinessId(businessIds: string[]): Promise<LoyaltyTier[]> {
        try {
            const tiers = await this.loyaltyTier.findMany({
                where: { businessIds: { hasSome: businessIds } },
            });
            return tiers.map(tier => new LoyaltyTier({ ...tier }));
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta });
        }
    }

    async findTiersByCustomerPoints(points: number, businessIds: string[]): Promise<LoyaltyTier[]> {
        try {
            const tiers = await this.loyaltyTier.findMany({
                where: {
                    minPoints: {
                        lte: points
                    },
                    businessIds: { hasEvery: businessIds }
                },
                orderBy: {
                    minPoints: 'desc'
                }
            });
            return tiers.map(tier => new LoyaltyTier({ ...tier }));
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta });
        }
    }

    async addReward(tierId: string, rewardInput: CreateRewardInput[], { transactionClient }: { transactionClient?: PrismaClient } = {}): Promise<LoyaltyTier> {
        try {
            const tier = await (transactionClient ?? this).loyaltyTier.findUnique({ where: { id: tierId } });
            if (!tier) {
                throw new RequestValidationException({ message: "Loyalty tier not found" });
            }

            const updatedTier = await (transactionClient ?? this).loyaltyTier.update({
                where: { id: tierId },
                data: {
                    rewards: {
                        push: rewardInput.map(r => ({
                            name: r.name.map(n => new LocalizedField(n)),
                            description: r.description.map(d => new LocalizedField(d)),
                            businessIds: r.businessIds,
                            minPointsToRedeem: r.minPointsToRedeem,
                            rewardType: r.rewardTypes,
                            rewardInfo: r.rewardInfo.map(info => info.toRewardInfo())
                        }))
                    }
                }
            });
            return new LoyaltyTier({ ...updatedTier });
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta });
        }
    }

    async removeReward(tierId: string, rewardIds: string[], { transactionClient }: { transactionClient?: PrismaClient } = {}): Promise<LoyaltyTier> {
        try {
            const tier = await (transactionClient ?? this).loyaltyTier.findUnique({ where: { id: tierId } });
            if (!tier) {
                throw new RequestValidationException({ message: "Loyalty tier not found" });
            }

            const updatedTier = await this.loyaltyTier.update({
                where: { id: tierId },
                data: {
                    rewards: {
                        deleteMany: { where: { id: { in: rewardIds } } }
                    }
                },
            });
            return new LoyaltyTier({ ...updatedTier });
        } catch (error) {
            throw new PrismaException({ message: error.message, code: error.code, meta: error.meta });
        }
    }

    // ... rest of the repository methods remain the same
} 