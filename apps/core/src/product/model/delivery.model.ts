import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, ValidateIf } from "class-validator";


@ObjectType()
export class DeliveryInfo {
    @Field({ defaultValue: false })
    deliveryAvailable: boolean;
    @Field(types => Float)
    price?: number;
    @Field(types => Int, { description: 'Number of hour to finish the delivery' })
    deliveryTime?: number;
    @Field(types => Int, { description: 'Number of hour to prepare the delivery.' })
    timeToPrepare?: number;
    @Field()
    createdAt?: Date;
    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<DeliveryInfo>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class DeliveryInfoInput {
    @Field({ defaultValue: false })
    deliveryAvailable: boolean;

    @Field(types => Float)
    @ValidateIf((obj: DeliveryInfo, value) => obj.deliveryAvailable)
    @IsNotEmpty()
    @IsNumber()
    price?: number;

    @Field(types => Int, { description: 'Number of hour to finish the delivery' })
    @ValidateIf((obj: DeliveryInfo, value) => obj.deliveryAvailable)
    @IsNotEmpty()
    @IsNumber()
    deliveryTime?: number;

    @Field(types => Int, { description: 'Number of hour to prepare the delivery.' })
    @ValidateIf((obj: DeliveryInfo, value) => obj.deliveryAvailable)
    @IsNotEmpty()
    @IsNumber()
    timeToPrepare?: number;

    constructor(partial?: Partial<DeliveryInfoInput>) {
        Object.assign(this, partial);
    }

}