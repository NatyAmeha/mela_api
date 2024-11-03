import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Reward } from "./reward.model";
import { CustomerLoyalty } from "./customer_loyalty.model";
import { Customer } from "../../customer/model/customer.model";

@ObjectType()
export class LoyaltyResponse extends BaseResponse {
    @Field(type => [Reward])
    rewards?: Reward[];

    @Field(type => CustomerLoyalty)
    customerLoyalty?: CustomerLoyalty

    @Field(type => [CustomerLoyalty])
    customerLoyalties?: CustomerLoyalty[]

    @Field(type => Customer)
    customer?: Customer


    constructor(data: Partial<LoyaltyResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class LoyaltyResponseBuilder extends BaseResponseBuilder {


    constructor(private loyaltyResponse: LoyaltyResponse = new LoyaltyResponse({})) {
        super(loyaltyResponse);

    }

    withError(error: string): LoyaltyResponse {
        this.loyaltyResponse.success = false
        this.loyaltyResponse.message = error
        return this.loyaltyResponse;
    }

    withRewards(rewards: Reward[]): LoyaltyResponseBuilder {
        this.loyaltyResponse.success = true
        this.loyaltyResponse.rewards = rewards
        return this
    }

    withCustomerLoyalty(customerLoyalty: CustomerLoyalty): LoyaltyResponseBuilder {
        this.loyaltyResponse.success = true
        this.loyaltyResponse.customerLoyalty = customerLoyalty
        return this
    }

    withCustomerLoyalties(customerLoyalties: CustomerLoyalty[]): LoyaltyResponseBuilder {
        this.loyaltyResponse.success = true
        this.loyaltyResponse.customerLoyalties = customerLoyalties
        return this
    }

    withCustomer(customer: Customer): LoyaltyResponseBuilder {
        this.loyaltyResponse.success = true
        this.loyaltyResponse.customer = customer
        return this
    }




    build(): LoyaltyResponse {
        return this.loyaltyResponse
    }
}