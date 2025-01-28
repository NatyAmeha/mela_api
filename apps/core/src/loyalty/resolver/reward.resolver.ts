import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Reward, RewardProductInfo } from "../model/reward.model";
import { Business } from "../../business/model/business.model";
import { Product } from "../../product/model/product.model";
import { RewardBusinessLoader, RewardProductLoader } from "../data_loader/reward.data_loader";

@Resolver(() => Reward)
export class RewardResolver {
    constructor(
        private readonly businessLoader: RewardBusinessLoader,
    ) { }

    @ResolveField("businesses", () => [Business], { nullable: true })
    async businesses(@Parent() reward: Reward): Promise<Business[]> {
        if (!reward.businessIds?.length) {
            return [];
        }
        return await Promise.all(
            reward.businessIds.map(id => this.businessLoader.load(id))
        );
    }
}

@Resolver(() => RewardProductInfo)
export class RewardProductInfoResolver {
    constructor(
        private readonly productLoader: RewardProductLoader,
    ) { }

    @ResolveField("product", () => Product, { nullable: true })
    async product(@Parent() rewardProductInfo: RewardProductInfo): Promise<Product> {
        return this.productLoader.load(rewardProductInfo.productId);
    }
}
