import { Inject, Injectable } from "@nestjs/common";
import { ICustomerRepository, CustomerRepository } from "./repo/customer.repository";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { Customer } from "./model/customer.model";
import { CustomerResponse, CustomerResponseBuilder } from "./model/customer.response";
import { Order } from "../model/order.model";
import { User } from "apps/auth/src/auth/model/user.model";
import { AppException } from "@app/common/errors/app_exception.model";
import { ExceptionHelper } from "@app/common/errors/exception_helper";
import { ILoyaltyRepository, LoyaltyRepository } from "../loyalty/repo/loyalty.repository";
import { CreateCustomerInput } from "./dto/customer.input";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";

@Injectable()
export class CustomerService {
    constructor(
        @Inject(CustomerRepository.injectName) private customerRepository: ICustomerRepository,
        @Inject(LoyaltyRepository.injectName) private loyaltyRepository: ILoyaltyRepository,
        @Inject(ClassDecoratorValidator.injectName) private inputValidator: IValidator
    ) { }


    async addCustomers(businessId: string, customersInput: CreateCustomerInput[]): Promise<CustomerResponse> {
        await this.inputValidator.validateArrayInput(customersInput, CreateCustomerInput);
        const customersInfo = customersInput.map(customer => Customer.fromInput(customer, businessId))
        const customersResult = await this.customerRepository.addCustomers(customersInfo)
        return new CustomerResponseBuilder().withCustomers(customersResult).build()
    }

    async getBusinessCustomers(businessId: string, page: number, limit: number) {
        const queryHelper: QueryHelper<Customer> = { page, limit }
        const result = await this.customerRepository.getBusinessCustomers(businessId, queryHelper)
        return new CustomerResponseBuilder().withCustomers(result).build()
    }

    async handleCustomerLoyalty(currentUser: User, order: Order) {
        const businessId = order.businessId[0]
        let customerInfo = Customer.getCurrentUserAsCustomer(currentUser, businessId)
        customerInfo = await this.customerRepository.addOrGetCustomer(customerInfo)
        // deduct loyalty points from customer
        const appliedRewards = order.getAppliedRewards()
        if (appliedRewards?.length > 0) {
            const usedRewardPoints = await this.loyaltyRepository.getRewardsPoints(appliedRewards)
            const customerLoyaltyInfo = await this.loyaltyRepository.deductLoayltyPoints(customerInfo.id, customerInfo.businessId, usedRewardPoints)
            console.log('response', usedRewardPoints, customerLoyaltyInfo)
        }

        // apply loyalty points to customer
        const totalEarnedPoints = order.getPoints()
        if (totalEarnedPoints > 0) {
            const customerLoyaltyInfo = await this.loyaltyRepository.addOrGetCustomerLoyalty(customerInfo.id, customerInfo.businessId)
            await this.loyaltyRepository.addPointsToCustomerLoyalty(customerLoyaltyInfo.customerId, customerLoyaltyInfo.businessId, totalEarnedPoints)
        }
    }

    async getCustomerDetails(customerId: string, businessId: string) {
        const customerInfo = await this.customerRepository.getBusinessCustomer(customerId, businessId)
        return new CustomerResponseBuilder().withCustomer(customerInfo).build()
    }
}