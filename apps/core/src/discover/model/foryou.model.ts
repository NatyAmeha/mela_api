import { Business } from "../../business/model/business.model";
import { DiscoverResponse } from "./discover_response.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";
import { ProductBundle } from "../../product/model/product_bundle.model";
import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { ProductDiscoverResponse } from "./product_discover.response";
import { BundleDiscoverResponse } from "./bundle_discover.response";


@ObjectType()
export class ForYouResponse extends BaseResponse {
    @Field(type => [Business])
    favoriteBusinesses?: Business[];
    @Field(type => [ProductDiscoverResponse])
    topProductsByBusiness?: ProductDiscoverResponse[]
    @Field(type => [BundleDiscoverResponse])
    bundles?: BundleDiscoverResponse[]

    constructor(data: Partial<ForYouResponse>) {
        super()
        Object.assign(this, data)
    }
}

export class ForYouResponseResponseBuilder extends BaseResponseBuilder {
    constructor(private response: ForYouResponse = new ForYouResponse({})) {
        super(response);
    }

    withFavoriteBusinesses(favoriteBusinesses: Business[]): ForYouResponseResponseBuilder {
        this.response.success = true;
        this.response.favoriteBusinesses = favoriteBusinesses;
        return this;
    }

    withTopProductsByBusiness(topProductsByBusiness: ProductDiscoverResponse[]): ForYouResponseResponseBuilder {
        this.response.success = true;
        this.response.topProductsByBusiness = topProductsByBusiness;
        return this;
    }

    withBundles(bundles: BundleDiscoverResponse[]): ForYouResponseResponseBuilder {
        this.response.success = true;
        this.response.bundles = bundles;
        return this;
    }

    build(): ForYouResponse {
        return this.response
    }
}