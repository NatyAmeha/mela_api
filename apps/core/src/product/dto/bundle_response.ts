import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { ProductBundle } from "../model/product_bundle.model";
import { Product } from "../model/product.model";
import { Branch } from "../../branch/model/branch.model";
import { Business } from "../../business/model/business.model";

@ObjectType()
export class BundleResponse extends BaseResponse {
    @Field(types => ProductBundle)
    bundle?: ProductBundle


    constructor(data: Partial<BundleResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class BundleResponseBuilder extends BaseResponseBuilder {
    constructor(private bundleResponse = new BundleResponse({})) {
        super(bundleResponse)
        this.bundleResponse = new BundleResponse({})
    }


    withBundle(bundle: ProductBundle): BundleResponseBuilder {
        this.bundleResponse.success = true
        this.bundleResponse.bundle = bundle
        return this
    }
    withProducts(products: Product[]): BundleResponseBuilder {
        this.bundleResponse.success = true
        this.bundleResponse.bundle.products = products
        return this
    }
    withBranches(branches: Branch[]): BundleResponseBuilder {
        this.bundleResponse.success = true
        this.bundleResponse.bundle.branches = branches
        return this
    }
    withBusinesses(businesses: Business[]): BundleResponseBuilder {
        this.bundleResponse.success = true
        this.bundleResponse.bundle.businesses = businesses
        return this
    }
    build(): BundleResponse {
        return this.bundleResponse
    }
}