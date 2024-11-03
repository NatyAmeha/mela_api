import { ObjectType } from "@nestjs/graphql";
import { ProductDiscovery } from "../model/product_discovery";
import { BusinessDiscovery } from "../model/business_discovery.model";
import { BundleDiscovery } from "../model/bundle_discover.model";
import { MembershipDiscovery } from "../model/membership_discovery.model";
import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";

@ObjectType()
export class DiscoveryResponse extends BaseResponse {
    productsResponse?: ProductDiscovery[]
    businessesResponse?: BusinessDiscovery[]
    bundlesResponse?: BundleDiscovery[]
    membershipsResponse?: MembershipDiscovery[]

    constructor(partial: Partial<DiscoveryResponse>) {
        super()
        Object.assign(this, partial)
    }
}

export class DiscoveryResponseBuilder extends BaseResponseBuilder {
    constructor(private response: DiscoveryResponse = new DiscoveryResponse({})) {
        super(response);
    }

    withProductsResponse(productsResponse: ProductDiscovery[]): DiscoveryResponseBuilder {
        this.response.success = true;
        this.response.productsResponse = productsResponse;
        return this;
    }

    withBusinessesResponse(businessesResponse: BusinessDiscovery[]): DiscoveryResponseBuilder {
        this.response.success = true;
        this.response.businessesResponse = businessesResponse;
        return this;
    }

    withBundlesResponse(bundlesResponse: BundleDiscovery[]): DiscoveryResponseBuilder {
        this.response.success = true;
        this.response.bundlesResponse = bundlesResponse;
        return this;
    }

    withMembershipsResponse(membershipsResponse: MembershipDiscovery[]): DiscoveryResponseBuilder {
        this.response.success = true;
        this.response.membershipsResponse = membershipsResponse;
        return this;
    }

    build(): DiscoveryResponse {
        return this.response
    }


}