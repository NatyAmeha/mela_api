import { Field, Float, InputType, Int, OmitType, PartialType, registerEnumType } from "@nestjs/graphql";
import { Product, ProductType, ProductUnitType } from "../model/product.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Type } from "class-transformer";
import { GalleryInput } from "../../business/model/gallery.model";
import { DeliveryInfoInput } from "../model/delivery.model";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";


@InputType()
export class CreateProductInput {
    @Field(type => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    name: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @IsArray()
    description: LocalizedFieldInput[];

    @Field(types => GalleryInput)
    @Type(() => GalleryInput)
    gallery: GalleryInput;

    @Field(types => [String])
    tag?: string[];


    @Field(types => Int, { defaultValue: 1 })
    minimumOrderQty?: number

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => [String])
    productGroupId?: string[];

    @Field(types => [String])
    category: string[];

    @Field(types => Float)
    price: number;

    @Field(types => ProductType)
    type: string;

    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field(types => ProductUnitType, { defaultValue: "Unit" })
    unit?: string;

    @Field(types => [String])
    reviewTopics?: string[];

    @Field(types => String, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => DeliveryInfoInput)
    @Type(() => DeliveryInfoInput)
    @ValidateNested()
    deliveryInfo?: DeliveryInfoInput;

    constructor(partial?: Partial<CreateProductInput>) {
        Object.assign(this, partial);
    }

    toProduct(businessId: string): Product {
        var product = new Product({ ...this, businessId: businessId });
        return product;
    }

}


@InputType()
export class BuilkProductCreateInput extends PartialType(CreateProductInput) {
    name?: LocalizedFieldInput[];
    description?: LocalizedFieldInput[];
    images: string[];
    minimumOrderQty?: number;
    category?: string[];
    price: number;
    unit?: string;
    deliveravailable?: boolean;
    deliveryPrice: number;
    deliveryTime?: number;
    timeToPrepare?: number;


    toProduct = (businessId: string): Product => {
        var product = new Product({
            ...this,
            gallery: new GalleryInput({ images: this.images.map(image => ({ url: image })) }),
            deliveryInfo: new DeliveryInfoInput({
                deliveryAvailable: this.deliveravailable,
                price: this.deliveryPrice,
                deliveryTime: this.deliveryTime,
                timeToPrepare: this.timeToPrepare
            }),
            businessId: businessId
        });
        return product;
    }
}



@InputType()
export class UpdateProductInput extends PartialType(OmitType(CreateProductInput, ['branchIds'] as const, InputType)) {

    getProductInfoToBeUpdated(): Product {
        return new Product({ ...this });
    }
}