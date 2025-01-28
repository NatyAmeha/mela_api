import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { OrderConfig } from "./order.config.model";

@ObjectType()
export class AddonUsage {
    @Field(type => String)
    addonId: string

    @Field(type => Float)
    count: number

    @Field(type => [OrderIdInfo])
    orderIdInfo?: OrderIdInfo[]

    constructor(partial?: Partial<AddonUsage>) {
        Object.assign(this, partial);
    }


}

@ObjectType()
export class OrderIdInfo {
    @Field(type => String)
    orderId: string
    @Field(type => OrderConfig)
    config?: OrderConfig

    @Field(type => Date, { nullable: true })
    dateCreated?: Date

    constructor(partial?: Partial<OrderIdInfo>) {
        Object.assign(this, partial)
    }
}
