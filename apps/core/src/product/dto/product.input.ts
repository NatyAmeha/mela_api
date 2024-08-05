import { Field, Float, InputType, Int, OmitType, PartialType, registerEnumType } from "@nestjs/graphql";
import { Product, ProductType } from "../model/product.model";
import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Type } from "class-transformer";
import { GalleryInput } from "../../business/model/gallery.model";
import { DeliveryInfoInput } from "../model/delivery.model";
import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateIf, ValidateNested, validate } from "class-validator";
import { CreateInventoryInput } from "./inventory.input";
import { ProductOptionInput } from "../model/product_options.model";
import { PriceInput } from "@app/common/model/price.model";


@InputType()
export class CreateProductInput {
    @Field(types => [LocalizedFieldInput], { description: "Variant name for the main product" })
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty()
    name: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput], { description: "display name, will be shown on browsing sectioin " })
    @Type(() => LocalizedFieldInput)
    @ValidateIf((obj: CreateProductInput, value) => obj.mainProduct == true)
    @ValidateNested({ each: true, })
    displayName?: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ValidateIf((obj: CreateProductInput, value) => obj.mainProduct == true)
    @ValidateNested({ each: true })
    description?: LocalizedFieldInput[];

    @Field(types => [PriceInput])
    @Type(() => PriceInput)
    defaultPrice: PriceInput[]

    @Field(types => GalleryInput)
    @Type(() => GalleryInput)
    @ValidateNested({ each: true })
    gallery: GalleryInput;

    @Field(types => [String])
    tag?: string[];

    @Field({ defaultValue: false })
    mainProduct?: boolean

    @Field(types => Int, { defaultValue: 0 })
    loyaltyPoint: number;

    @Field(types => [String])
    sectionId?: string[];

    @Field(types => [String])
    category: string[];


    @Field(types => ProductType)
    type: string;

    @Field(types => CreateInventoryInput)
    @Type(() => CreateInventoryInput)
    @ValidateNested({ always: true, each: true })
    inventoryInfo: CreateInventoryInput

    @Field(types => [ProductOptionInput])
    @Type(() => ProductOptionInput)
    @ValidateNested({ always: true, each: true })
    @ValidateIf((obj: CreateProductInput, value) => obj.mainProduct == true)
    @ArrayNotEmpty({ message: "options should not be empty if the mainproduct field is true" })
    options?: ProductOptionInput[]

    @Field(types => [String])
    @IsArray()
    optionsIncluded: string[];


    @Field(types => [String])
    reviewTopics?: string[];

    @Field(types => String, { defaultValue: "Order" })
    callToAction?: string;

    @Field(types => [String])
    branchIds?: string[];

    @Field(types => Boolean, { defaultValue: false })
    canOrderOnline: boolean;

    @Field()
    deliveryInfoId?: string

    constructor(partial?: Partial<CreateProductInput>) {
        Object.assign(this, partial);
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


    toProduct = async (businessId: string): Promise<Product> => {
        const error = await validate(this);
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