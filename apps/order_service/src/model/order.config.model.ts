import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { types } from "joi";
import { CreateOrderConfigInput } from "../dto/order_config.input";

export enum OrderConfigType {
    SINGLE_VALUE = 'SINGLE_VALUE',
    MULTIPLE_VALUE = 'MULTIPLE_VALUE',
    PRODUCT_ID_VALUE = 'PRODUCT_ID_VALUE',
}

@ObjectType()
@Directive('@shareable')
export class OrderConfig {
    @Field(type => [LocalizedField])
    name: LocalizedField[];
    @Field()
    type: string;
    @Field()
    singleValue?: string;
    @Field(type => [String])
    multipleValue?: string[];
    @Field(type => [String])
    productIds?: string[];
    @Field({ defaultValue: 0 })
    additionalPrice: number;
    @Field()
    addonId?: string;

    constructor(partial?: Partial<OrderConfig>) {
        Object.assign(this, partial)
    }

    static createOrderConfig(data: CreateOrderConfigInput): OrderConfig {
        return new OrderConfig({
            name: data.name.map((name) => new LocalizedField(name)),
            ...data,
        })
    }
}



registerEnumType(OrderConfigType, { name: 'OrderConfigType' });