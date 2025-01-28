import { LocalizedField, LocalizedFieldInput } from "@app/common/model/localized_model";
import { Field, Float, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { DeliveryRewardInfo, RewardInfo, RewardProductInfo } from "../model/reward.model";
import { DiscountInput } from "../../product/dto/discount_intput";

@InputType()
export class CreateRewardInput {
    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput])
    name: LocalizedFieldInput[];

    @Type(() => LocalizedFieldInput)
    @Field(type => [LocalizedFieldInput], { nullable: true })
    description?: LocalizedFieldInput[];

    @Field(type => [String])
    businessIds: string[];

    @Field(type => [String])
    rewardTypes: string[];

    @Field(type => [RewardInfoInput])
    @Type(() => RewardInfoInput)
    rewardInfo: RewardInfoInput[];

    @IsNumber()
    @Field(type => Float)
    minPointsToRedeem: number;

    constructor(partial?: Partial<CreateRewardInput>) {
        Object.assign(this, partial);
    }
}

@InputType()
export class DeliveryRewardInfoInput {
    @Field(type => Float, { nullable: true })
    minPurchaseAmount?: number;

    @Field(type => DiscountInput)
    @Type(() => DiscountInput)
    discount?: DiscountInput;

    constructor(partial?: Partial<DeliveryRewardInfoInput>) {
        Object.assign(this, partial);
    }

    toRewardInfo(): DeliveryRewardInfo {
        return new DeliveryRewardInfo({
            minPurchaseAmount: this.minPurchaseAmount,
            discount: this.discount?.toDiscount()
        });
    }
}

@InputType()
export class RewardInfoInput {
    @Field(type => [RewardProductInfoInput])
    @Type(() => RewardProductInfoInput)
    products?: RewardProductInfoInput[];

    @Field(type => DeliveryRewardInfoInput)
    @Type(() => DeliveryRewardInfoInput)
    deliveryInfo?: DeliveryRewardInfoInput;

    @Field(type => DiscountInput)
    @Type(() => DiscountInput)
    discount?: DiscountInput;

    constructor(partial?: Partial<RewardInfoInput>) {
        Object.assign(this, partial);
    }

    toRewardInfo(): RewardInfo {
        return new RewardInfo({
            products: this.products?.map(f => f.toRewardInfo()),
            discount: this.discount?.toDiscount(),
            deliveryRewardInfo: this.deliveryInfo?.toRewardInfo()
        });
    }
}

@InputType()
export class RewardProductInfoInput {
    @Field()
    productId: string;

    @Field(type => Float, { defaultValue: 1 })
    minQty: number;

    @Field(type => Float, { defaultValue: 10 })
    maxQty: number;

    @Field(type => DiscountInput)
    @Type(() => DiscountInput)
    discount?: DiscountInput;

    constructor(partial?: Partial<RewardProductInfoInput>) {
        Object.assign(this, partial);
    }

    toRewardInfo(): RewardProductInfo {
        return new RewardProductInfo({
            productId: this.productId,
            minQty: this.minQty,
            maxQty: this.maxQty,
            discount: this.discount?.toDiscount()
        });
    }
} 