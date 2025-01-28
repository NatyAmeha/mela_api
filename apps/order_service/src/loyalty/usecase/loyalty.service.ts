import { Inject, Injectable } from "@nestjs/common";
import { ILoyaltyRepository, LoyaltyRepository } from "../repo/loyalty.repository";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { CustomerLoyaltyResponse, LoyaltyResponseBuilder } from "../model/loyalty.response";
import { CustomerRepository, ICustomerRepository } from "../../customer/repo/customer.repository";

@Injectable()
export class LoyaltyService {
    constructor(
        @Inject(LoyaltyRepository.injectName) private loyaltyRepo: ILoyaltyRepository,
        @Inject(CustomerRepository.injectName) private customerRepo: ICustomerRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator) { }



    async getCustomerLoyalties(userId: string): Promise<CustomerLoyaltyResponse> {
        let response = new LoyaltyResponseBuilder()
        const customers = await this.customerRepo.getCustomersByUserId(userId)
        if (!customers || customers.length == 0) {
            return response.withCustomerLoyalties([]).build()
        }
        const customerLoyalties = await this.loyaltyRepo.getLoyaltiesByCustomerIds(customers.map(customer => customer.id))
        return response.withCustomerLoyalties(customerLoyalties).build()
    }

    async getBusinessRewards(businessId: string, currentUserId?: string): Promise<CustomerLoyaltyResponse> {
        let response = new LoyaltyResponseBuilder()
        if (currentUserId) {
            const customerResult = await this.customerRepo.getBusinessCustomer(currentUserId, businessId)
            console.log('customerResult', businessId, customerResult,)
            if (customerResult?.id) {
                const customerLoyalty = await this.loyaltyRepo.getCustomerLoyalty(customerResult.id, businessId)
                response = response.withCustomerLoyalty(customerLoyalty).withCustomer(customerResult)
                return response.build();
            }
            else {
                return response.basicResponse(false, 'User is not a customer of the business')
            }
        }
        else {
            return response.basicResponse(false, 'Customer not found');
        }
    }
} 