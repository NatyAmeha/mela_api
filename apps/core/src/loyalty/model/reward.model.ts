import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { Discount } from "../../product/model/discount.model";
import { Business } from "../../business/model/business.model";
import { Product } from "../../product/model/product.model";

export enum RewardType {
    DISCOUNT = "DISCOUNT",
    POINTS = "POINTS",
    FREE_ITEM = "FREE_ITEM",
    FREE_DELIVERY = "FREE_DELIVERY"
}

@ObjectType()
@Directive('@shareable')
export class Reward {
    @Field(type => ID)
    id: string;

    @Field(type => [LocalizedField])
    name: LocalizedField[];

    @Field(type => [LocalizedField])
    description: LocalizedField[];

    @Field(type => Int, { nullable: true })
    minPointsToRedeem?: number;

    @Field(type => [String], { nullable: true })
    businessIds?: string[];

    @Field(type => [Business])
    businesses?: Business[];

    @Field(type => [String])
    rewardTypes?: string[];

    @Field(type => Boolean, { defaultValue: false })
    applyOnAddon?: boolean;

    @Field(type => [RewardInfo])
    rewardInfo?: RewardInfo[];

    @Field({ defaultValue: true })
    isActive: boolean;

    @Field()
    createdAt?: Date;

    @Field()
    updatedAt?: Date;

    constructor(partial?: Partial<Reward>) {
        Object.assign(this, partial);
    }
}

@ObjectType()
@Directive('@shareable')
export class DeliveryRewardInfo {
    @Field(type => String)
    id: string;

    @Field(type => [LocalizedField])
    description: LocalizedField[];

    @Field(type => Float, { nullable: true })
    minPurchaseAmount?: number;

    @Field(type => Discount)
    discount?: Discount;

    constructor(partial?: Partial<DeliveryRewardInfo>) {
        Object.assign(this, partial);
    }
}

@ObjectType()
@Directive('@shareable')
export class RewardInfo {
    @Field(type => Discount)
    discount?: Discount;

    @Field(type => DeliveryRewardInfo)
    deliveryRewardInfo?: DeliveryRewardInfo;

    @Field(type => [RewardProductInfo])
    products?: RewardProductInfo[];



    constructor(partial?: Partial<RewardInfo>) {
        Object.assign(this, partial);
    }
}

@ObjectType()
@Directive('@shareable')
export class RewardProductCriteria {
    @Field(type => String)
    id: string;

    @Field(type => Float)
    minPurchaseAmount?: number;

    @Field(type => [String])
    purchasedProductIds?: string[];

    constructor(partial?: Partial<RewardProductCriteria>) {
        Object.assign(this, partial);
    }
}

@ObjectType()
@Directive('@shareable')
export class RewardProductInfo {
    @Field(type => String)
    id: string;

    @Field(type => String)
    productId: string;

    @Field(type => Product)
    product?: Product;

    @Field(type => Float, { defaultValue: 1 })
    minQty: number;

    @Field(type => Float, { defaultValue: 10 })
    maxQty: number;

    @Field(type => RewardProductCriteria)
    criteria?: RewardProductCriteria;

    @Field(type => Discount)
    discount?: Discount;

    constructor(partial?: Partial<RewardProductInfo>) {
        Object.assign(this, partial);
    }
} 