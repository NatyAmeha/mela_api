import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Customer } from "./customer.model";

@ObjectType()
export class CustomerResponse extends BaseResponse {
    @Field(type => Customer)
    customer?: Customer;

    @Field(type => [Customer])
    customers?: Customer[];



    constructor(data: Partial<CustomerResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class CustomerResponseBuilder extends BaseResponseBuilder {


    constructor(private customerResponse: CustomerResponse = new CustomerResponse({})) {
        super(customerResponse);

    }

    withError(error: string): CustomerResponse {
        this.customerResponse.success = false
        this.customerResponse.message = error
        return this.customerResponse;
    }

    withCustomer(customer: Customer): CustomerResponseBuilder {
        this.customerResponse.success = true
        this.customerResponse.customer = customer
        return this
    }

    withCustomers(customers: Customer[]): CustomerResponseBuilder {
        this.customerResponse.success = true
        this.customerResponse.customers = customers
        return this
    }




    build(): CustomerResponse {
        return this.customerResponse
    }
}