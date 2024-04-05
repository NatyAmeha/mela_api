import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, ValidateIf } from "class-validator";


@ObjectType()
@InputType("DeliveryInfoInput")
export class DeliveryInfo {
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

    @Field()
    createdAt?: Date;

    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<DeliveryInfo>) {
        Object.assign(this, partial);
    }
}