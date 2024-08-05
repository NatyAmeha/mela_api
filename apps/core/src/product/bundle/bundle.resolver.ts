import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { of } from "rxjs";
import { ProductBundle } from "../model/product_bundle.model";
import { Product } from "../model/product.model";
import { BundleResponse } from "../dto/bundle_response";
import { BundleService } from "../usecase/bundle.service";
import { ProductService } from "../usecase/product.service";

@Resolver(of => ProductBundle)
export class BundleResolver {
    constructor(private bundleService: BundleService, private productService: ProductService) { }

    @ResolveField('products', returns => [Product])
    async getBundleProducts(@Parent() bundle: ProductBundle): Promise<Product[]> {
        const bundleProductIds = bundle.productIds;
        if (!bundleProductIds || bundleProductIds.length === 0) {
            return [];
        }
        return await this.productService.getProductsById(bundleProductIds);
    }
}