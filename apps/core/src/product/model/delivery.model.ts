import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
@InputType("DeliveryInfoInput")
export class DeliveryInfo {
    @Field({ defaultValue: false })
    deliveryAvailable?: boolean;

    @Field(types => Float)
    price: number;

    @Field(types => Int)
    estimatedTimeToDeliver: number;

    @Field(types => Int)
    estimatedTimeFinish: number;
    constructor(partial?: Partial<DeliveryInfo>) {
        Object.assign(this, partial);
    }
}