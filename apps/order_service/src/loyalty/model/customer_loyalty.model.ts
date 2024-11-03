import { Directive, Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { Reward } from "./reward.model";
import { Customer } from "../../customer/model/customer.model";
import { LocalizedField } from "@app/common/model/localized_model";

@ObjectType()
@Directive('@shareable')
export class CustomerLoyalty {
    @Field(type => ID)
    id: string
    @Field(type => String)
    customerId: string

    @Field(type => [LocalizedField])
    name: LocalizedField[]
    @Field(type => String)
    businessId: string

    @Field(type => [PointSource], { defaultValue: [] })
    pointsSource: PointSource[]

    @Field(type => Float, { defaultValue: 0 })
    currentPoints: number


    @Field(type => Customer)
    customer?: Customer

    @Field(type => [Reward], { nullable: true })
    businessRewards?: Reward[]

    @Field(type => Date, { defaultValue: new Date() })
    createdAt?: Date
    @Field(type => Date, { defaultValue: new Date() })
    updatedAt?: Date

    constructor(data: Partial<CustomerLoyalty>) {
        Object.assign(this, data)
    }
}
@ObjectType()
@Directive('@shareable')
export class PointSource {
    @Field(type => String)
    id: string

    @Field(type => String)
    name: string

    @Field(type => String)
    sourceId: string

    @Field(type => String)
    sourceType: string

    @Field(type => Float)
    value: number

}
