import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { ProductBundle } from "../model/product_bundle.model";

@ObjectType({ isAbstract: true })
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
    build(): BundleResponse {
        return this.bundleResponse
    }
}