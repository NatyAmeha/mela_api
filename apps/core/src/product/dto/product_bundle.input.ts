import { LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, Float, InputType } from "@nestjs/graphql";
import { BundleType } from "../model/product_bundle.model";
import { ArrayNotEmpty, IsDate, IsNotEmpty, ValidateIf } from "class-validator";
import { GalleryInput } from "../../business/model/gallery.model";
import { DiscountCondition, DiscountType } from "../model/discount.model";
import { Type } from "class-transformer";

@InputType()
export class CreateBundleInput {
    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty()
    name: LocalizedFieldInput[]

    @Field(types => [LocalizedFieldInput])
    @Type(() => LocalizedFieldInput)
    @ArrayNotEmpty()
    description: LocalizedFieldInput[]

    @Field(types => [String])
    @ArrayNotEmpty()
    productIds: string[]

    @Field(types => BundleType, { defaultValue: BundleType.PRODUCT_BUNDLE })
    type: string

    @Field()
    @ValidateIf((obj: CreateBundleInput) => obj.type == BundleType.TIMELY_BUNDLE)
    @IsNotEmpty({ message: "Start date is required for timely bundle" })
    @IsDate({ message: "Start date must be a valid date" })
    startDate?: Date

    @Field()
    @ValidateIf((obj: CreateBundleInput) => obj.type == BundleType.TIMELY_BUNDLE)
    @IsNotEmpty({ message: "End date is required for timely bundle" })
    @IsDate({ message: "End date must be a valid date" })
    endDate?: Date

    @Field(types => GalleryInput)
    @Type(() => LocalizedFieldInput)
    @IsNotEmpty()
    gallery: GalleryInput

    @Field(types => DiscountType)
    discountType?: string

    @Field(types => Number)
    @ValidateIf((obj: CreateBundleInput) => obj.discountType != null)
    @IsNotEmpty()
    discountValue?: number

    @Field(types => DiscountCondition, { defaultValue: DiscountCondition.NONE })
    condition?: string

    @Field(types => Float)
    @ValidateIf((obj: CreateBundleInput) => (obj.condition != DiscountCondition.NONE && obj.condition != DiscountCondition.PURCHASE_ALL_ITEMS))
    @IsNotEmpty()
    conditionValue?: number



}