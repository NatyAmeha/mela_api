import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { Reward } from "../model/reward.model"
import { plainToClass } from "class-transformer";
import { RedeemedReward } from "../model/redeemed_reward.model";
import { CustomerLoyalty } from "../model/customer_loyalty.model";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { sumBy } from "lodash";

export interface ILoyaltyRepository {
    addTransactionClient: (client: PrismaClient) => void
    addReward(reward: Reward): Promise<Reward>
    createRewards(businessId: string, rewards: Reward[]): Promise<Reward[]>
    getReward(rewardId: string): Promise<Reward>
    getRewards(rewardIds: string[]): Promise<Reward[]>
    getRewardsPoints(rewardIds: string[]): Promise<number>
    getBusinessRewards(businessId: string): Promise<Reward[]>

    addRedeemedReward(redeemedReward: RedeemedReward): Promise<RedeemedReward>
    getRedeemedRewards(customerId: string): Promise<RedeemedReward[]>

    getCustomerLoyalty(customerId: string, businessId: string): Promise<CustomerLoyalty>
    getCustomerLoyalties(customerId: string): Promise<CustomerLoyalty[]>
    addOrGetCustomerLoyalty(customerId: string, businessId: string): Promise<CustomerLoyalty>
    addPointsToCustomerLoyalty(customerId: string, businessId: string, points: number): Promise<CustomerLoyalty>
    deductLoayltyPoints(customerId: string, businessId: string, points: number): Promise<CustomerLoyalty>
}

@Injectable()
export class LoyaltyRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ILoyaltyRepository {
    static injectName = 'LOYALTY_REPOSITORY'

    transactionClient: PrismaClient | null

    addTransactionClient(client: PrismaClient): void {
        this.transactionClient = client;
    }

    async onModuleInit() {
        await this.$connect()
    }

    async addReward(reward: Reward): Promise<Reward> {
        try {
            const createRewardResult = await (this.transactionClient || this).reward.create({ data: reward })
            return plainToClass(Reward, createRewardResult)
        } catch (error) {
            console.log(error)
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error adding reward"
            })
        }
    }

    async createRewards(businessId: string, rewards: Reward[]): Promise<Reward[]> {
        try {
            rewards.forEach(reward => reward.businessId = businessId)
            const rewardCreateResults = await (this.transactionClient || this).$transaction(async (tx) => {
                const result = await Promise.all(rewards.map(async reward => {
                    const createResult = await tx.reward.create({ data: reward })
                    return plainToClass(Reward, createResult)
                }))
                return result
            })
            return rewardCreateResults.map(reward => plainToClass(Reward, reward))
        } catch (error) {
            console.log(error)
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error creating rewards"
            })
        }
    }

    async getReward(rewardId: string): Promise<Reward> {
        try {
            const reward = await (this.transactionClient || this).reward.findUnique({ where: { id: rewardId } })
            return plainToClass(Reward, reward)
        } catch (error) {
            throw error
        }
    }

    async getRewards(rewardIds: string[]): Promise<Reward[]> {
        try {
            const rewards = await (this.transactionClient || this).reward.findMany({ where: { id: { in: rewardIds } } })
            return rewards.map(reward => plainToClass(Reward, reward))
        } catch (error) {
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error getting rewards"
            })
        }
    }

    async getRewardsPoints(rewardIds: string[]): Promise<number> {
        try {
            const rewards = await (this.transactionClient || this).reward.findMany({ where: { id: { in: rewardIds } } })
            if (rewards?.length > 0) {
                const totalPoints = sumBy(rewards, reward => reward.minPointsToRedeem)
                return totalPoints
            }
            return 0;
        } catch (error) {
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error getting rewards points"
            })
        }
    }

    async getBusinessRewards(businessId: string): Promise<Reward[]> {
        try {
            const rewards = await (this.transactionClient || this).reward.findMany({ where: { businessId } })
            return rewards.map(reward => plainToClass(Reward, reward))
        } catch (error) {
            throw error
        }
    }

    async getCustomerLoyalty(customerId: string, businessId: string): Promise<CustomerLoyalty> {
        try {
            const customerLoyalty = await (this.transactionClient || this).customerLoyalty.findFirst({ where: { customerId, businessId } })
            if (!customerLoyalty) {
                return null
            }
            return plainToClass(CustomerLoyalty, customerLoyalty)
        } catch (error) {
            throw error
        }
    }

    async getCustomerLoyalties(customerId: string): Promise<CustomerLoyalty[]> {
        try {
            const customerLoyalties = await (this.transactionClient || this).customerLoyalty.findMany({ where: { customerId } })
            return customerLoyalties.map(customerLoyalty => plainToClass(CustomerLoyalty, customerLoyalty))
        } catch (error) {
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error getting customer loyalties"
            })
        }
    }

    async addRedeemedReward(redeemedReward: RedeemedReward): Promise<RedeemedReward> {
        try {
            const createRedeemedRewardResult = await (this.transactionClient || this).redeemedReward.create({ data: redeemedReward })
            return plainToClass(RedeemedReward, createRedeemedRewardResult)
        } catch (error) {
            throw error
        }
    }

    async getRedeemedRewards(customerId: string): Promise<RedeemedReward[]> {
        try {
            const redeemedRewards = await (this.transactionClient || this).redeemedReward.findMany({ where: { customerId } })
            return redeemedRewards.map(redeemedReward => plainToClass(RedeemedReward, redeemedReward))
        } catch (error) {
            throw error
        }
    }


    async addOrGetCustomerLoyalty(customerId: string, businessId: string): Promise<CustomerLoyalty> {
        try {
            const existingCustomerLoyalty = await (this.transactionClient || this).customerLoyalty.findFirst({ where: { customerId, businessId } })
            if (existingCustomerLoyalty) {
                return plainToClass(CustomerLoyalty, existingCustomerLoyalty)
            }
            // const { customerId, ...customerLoyaltyData } = customerLoyalty
            const customerLoyaltyData = new CustomerLoyalty({ businessId, pointsSource: [], })
            const createCustomerLoyaltyResult = await (this.transactionClient || this).customer.update({
                where: { id: customerId },
                data: {
                    customerLoyalties: {
                        create: { ...customerLoyaltyData }
                    }
                }
            })
            return plainToClass(CustomerLoyalty, createCustomerLoyaltyResult)
        } catch (error) {
            throw error
        }
    }

    async addPointsToCustomerLoyalty(customerId: string, businessId: string, points: number): Promise<CustomerLoyalty> {
        try {
            const customerLoyalty = await (this.transactionClient || this).customerLoyalty.findFirst({
                where: { customerId: customerId, businessId: businessId }
            });
            if (!customerLoyalty) {
                throw new RequestValidationException({
                    source: LoyaltyRepository.name,
                    message: "Customer loyalty not found"
                });
            }

            const updatedCustomerLoyalty = await (this.transactionClient || this).customerLoyalty.update({
                where: { id: customerLoyalty.id }, data: {
                    currentPoints: { increment: points }
                }
            })
            return plainToClass(CustomerLoyalty, updatedCustomerLoyalty)
        } catch (error) {
        }
    }

    async deductLoayltyPoints(customerId: string, businessId: string, points: number): Promise<CustomerLoyalty> {
        try {
            const customerLoyalty = await (this.transactionClient || this).customerLoyalty.findFirst({
                where: { customerId: customerId, businessId: businessId }
            });

            if (!customerLoyalty) {
                throw new Error("Customer loyalty not found");
            }
            if (points > customerLoyalty.currentPoints) {
                return;
                // throw new RequestValidationException({
                //     source: LoyaltyRepository.name,
                //     message: "Insufficient points are applied"
                // })
            }
            const amountAfterDeduction = customerLoyalty.currentPoints - points > 0 ? customerLoyalty.currentPoints - points : 0;
            const updatedCustomerLoyalty = await (this.transactionClient || this).customerLoyalty.update({
                where: { id: customerLoyalty.id }, data: {
                    currentPoints: amountAfterDeduction
                }
            })
            return plainToClass(CustomerLoyalty, updatedCustomerLoyalty)
        } catch (error) {
            if (error instanceof RequestValidationException) {
                throw error
            }
            throw new PrismaException({
                source: LoyaltyRepository.name,
                message: "Error deducting loyalty points"
            })
        }
    }


    async onModuleDestroy() {
        await this.$disconnect()
    }
}
