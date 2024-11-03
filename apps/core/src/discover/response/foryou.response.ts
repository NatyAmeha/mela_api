import { Business } from "../../business/model/business.model";
import { IDiscovery } from "../model/discovery_interface.response";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";
import { ProductBundle } from "../../product/model/product_bundle.model";
import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { ProductDiscovery } from "../model/product_discovery";
import { BundleDiscovery } from "../model/bundle_discover.model";


@ObjectType()
export class ForYouResponse extends BaseResponse {
    @Field(type => [Business])
    favoriteBusinesses?: Business[];
    @Field(type => [ProductDiscovery])
    topProductsByBusiness?: ProductDiscovery[]
    @Field(type => [BundleDiscovery])
    bundles?: BundleDiscovery[]

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

    withTopProductsByBusiness(topProductsByBusiness: ProductDiscovery[]): ForYouResponseResponseBuilder {
        this.response.success = true;
        this.response.topProductsByBusiness = topProductsByBusiness;
        return this;
    }

    withBundles(bundles: BundleDiscovery[]): ForYouResponseResponseBuilder {
        this.response.success = true;
        this.response.bundles = bundles;
        return this;
    }

    build(): ForYouResponse {
        return this.response
    }
}