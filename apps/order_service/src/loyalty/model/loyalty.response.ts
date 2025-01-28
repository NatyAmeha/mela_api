import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { CustomerLoyalty } from "./customer_loyalty.model";
import { Customer } from "../../customer/model/customer.model";

@ObjectType()
export class CustomerLoyaltyResponse extends BaseResponse {

    @Field(type => CustomerLoyalty)
    customerLoyalty?: CustomerLoyalty

    @Field(type => [CustomerLoyalty])
    customerLoyalties?: CustomerLoyalty[]

    @Field(type => Customer)
    customer?: Customer


    constructor(data: Partial<CustomerLoyaltyResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class LoyaltyResponseBuilder extends BaseResponseBuilder {


    constructor(private loyaltyResponse: CustomerLoyaltyResponse = new CustomerLoyaltyResponse({})) {
        super(loyaltyResponse);

    }

    withError(error: string): CustomerLoyaltyResponse {
        this.loyaltyResponse.success = false
        this.loyaltyResponse.message = error
        return this.loyaltyResponse;
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






    build(): CustomerLoyaltyResponse {
        return this.loyaltyResponse
    }
}