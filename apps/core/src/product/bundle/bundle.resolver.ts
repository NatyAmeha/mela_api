import { Args, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { of } from "rxjs";
import { ProductBundle } from "../model/product_bundle.model";
import { Product } from "../model/product.model";
import { BundleResponse } from "../dto/bundle_response";
import { BundleService } from "../usecase/bundle.service";
import { ProductService } from "../usecase/product.service";
import { ProductBundleLoader } from "../product_data_loader.service";
import { Business } from "../../business/model/business.model";

@Resolver(of => ProductBundle)
export class BundleResolver {
    constructor(
        private bundleService: BundleService,
        private productService: ProductService,
        private productBundleLoader: ProductBundleLoader,
    ) { }

    @Query(returns => BundleResponse, { description: "Get bundle details with products, business, and branches info" })
    async getBundleDetail(@Args("bundleId") bundleId: string): Promise<BundleResponse> {
        let bundleResult = await this.bundleService.getBundleDetails(bundleId);
        return bundleResult;
    }

    @ResolveField('products', returns => [Product])
    async getBundleProducts(@Parent() bundle: ProductBundle): Promise<Product[]> {
        console.log("bundle bundle products resolve")
        const bundleProductIds = bundle.productIds;
        if (!bundleProductIds || bundleProductIds.length === 0) {
            return [];
        }
        return this.productBundleLoader.loader.load({ productIds: bundleProductIds });
    }

    @ResolveField('businesses', returns => [Business], { defaultValue: [] })
    async getBundleBusinesses(@Parent() bundle: ProductBundle): Promise<Business[]> {
        const bundleBusinessIds = bundle.businessIds;
        console.log("bundleBusinessIds", bundleBusinessIds)
        return this.bundleService.getBundleBusinesses(bundleBusinessIds);

    }
}