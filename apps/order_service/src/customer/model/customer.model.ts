import { ObjectType, Field, ID, InputType, Directive } from "@nestjs/graphql";
import { User } from "apps/auth/src/auth/model/user.model";
import { CustomerLoyalty } from "../../loyalty/model/customer_loyalty.model";
import { RedeemedReward } from "../../loyalty/model/redeemed_reward.model";
import { CreateCustomerInput } from "../dto/customer.input";

@ObjectType()
@Directive('@shareable')
export class Customer {
    @Field(type => ID)
    id: string;
    @Field()
    name: string;
    @Field()
    userId: string;
    @Field()
    businessId: string;
    @Field()
    phoneNumber: string;
    @Field()
    email?: string

    @Field(type => [CustomerLoyalty])
    customerLoyalties?: CustomerLoyalty[]

    @Field(type => [RedeemedReward])
    redeemedRewards?: RedeemedReward[]

    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<Customer>) {
        Object.assign(this, partial);
    }

    static fromInput(input: CreateCustomerInput, businessId: string): Customer {
        return new Customer({
            ...input,
            businessId
        });
    }

    static getCurrentUserAsCustomer(user: User, businessId: string): Customer {
        return new Customer({
            name: user.username,
            userId: user.id,
            businessId,
            phoneNumber: user.phoneNumber,
            email: user.email
        })
    }

    static newCustomerInfo(name: string, phoneNumber: string, businessId: string) {
        return new Customer({
            name: name,
            businessId,
            phoneNumber: phoneNumber
        })
    }


}

@InputType()
export class CustomerInput extends Customer {
    @Field()
    userId: string;

    @Field(types => [String], { defaultValue: [] })
    branchesId?: string[];

}