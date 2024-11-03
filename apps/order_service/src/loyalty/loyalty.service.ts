import { Inject, Injectable } from "@nestjs/common";
import { ILoyaltyRepository, LoyaltyRepository } from "./repo/loyalty.repository";
import { CreateRewardInput } from "./dto/reward.input";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { Reward } from "./model/reward.model";
import { LoyaltyResponse, LoyaltyResponseBuilder } from "./model/loyalty.response";
import { CustomerRepository, ICustomerRepository } from "../customer/repo/customer.repository";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

@Injectable()
export class LoyaltyService {
    constructor(
        @Inject(LoyaltyRepository.injectName) private loyaltyRepo: ILoyaltyRepository,
        @Inject(CustomerRepository.injectName) private customerRepo: ICustomerRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator) { }

    async createRewards(businessId: string, rewards: CreateRewardInput[]) {
        await this.inputValidator.validateArrayInput(rewards, CreateRewardInput);
        const rewardsInfo = rewards.map(input => Reward.fromInput(input))
        const result = await this.loyaltyRepo.createRewards(businessId, rewardsInfo);
        return new LoyaltyResponseBuilder().withRewards(result).build();
    }

    async getCustomerLoyalties(userId: string): Promise<LoyaltyResponse> {
        let response = new LoyaltyResponseBuilder()
        const customer = await this.customerRepo.getCustomerByUserId(userId)
        if (!customer) {
            return response.withCustomerLoyalties([]).build()
        }
        const customerLoyalties = await this.loyaltyRepo.getCustomerLoyalties(customer.id)
        return response.withCustomerLoyalties(customerLoyalties).build()
    }

    async getBusinessRewards(businessId: string, currentUserId?: string): Promise<LoyaltyResponse> {
        const rewardResults = await this.loyaltyRepo.getBusinessRewards(businessId);
        let response = new LoyaltyResponseBuilder().withRewards(rewardResults)
        if (currentUserId) {
            const customerResult = await this.customerRepo.getBusinessCustomer(currentUserId, businessId)
            if (customerResult?.id) {
                const customerLoyalty = await this.loyaltyRepo.getCustomerLoyalty(customerResult.id, businessId)
                response = response.withCustomerLoyalty(customerLoyalty).withCustomer(customerResult)
            }
        }
        return response.build();
    }
} 