import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../business/repo/business.repo";
import { ProductRepository } from "../product/repo/product.repository";
import { DiscoverResponse, DiscoverTypes } from "./model/discover_response.model";
import { Product } from "../product/model/product.model";
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model";
import { ProductBundleRepository } from "../product/repo/bundle..repository";
import { ProductBundle } from "../product/model/product_bundle.model";
import { ForYouResponse, ForYouResponseResponseBuilder as ForYouResponseBuilder } from "./model/foryou.model";
import { BundleDiscoverResponse } from "./model/bundle_discover.response";
import { ProductDiscoverResponse } from "./model/product_discover.response";

@Injectable()
export class DiscoverService {
    constructor(
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository,
        @Inject(ProductRepository.injectName) private productRepo: ProductRepository,
        @Inject(ProductBundleRepository.injectName) private productBundleRepo: ProductBundleRepository
    ) { }


    async getForYouData(userFavoriteBusinessIds: string[], limit: number): Promise<ForYouResponse> {
        const topProducts = await this.getTopProductsFromUserFavoriteBusinesses(userFavoriteBusinessIds, limit);
        const topBusinessBundles = await this.getTopBusinessBundles(userFavoriteBusinessIds, limit);
        const result = new ForYouResponseBuilder().withTopProductsByBusiness(topProducts).withBundles(topBusinessBundles).build();
        return result;
    }


    async getTopProductsFromUserFavoriteBusinesses(userFavoriteBusinessIds: string[], limit: number): Promise<ProductDiscoverResponse[]> {
        const businessIds = await this.businessRepo.findBusinessesById(userFavoriteBusinessIds);
        const topProductResponse = await Promise.all(
            businessIds.map(async (business) => {
                let businessProducts = await this.productRepo.getBusinessTopProducts(business.id, { limit: limit });
                let discoverResponse = ProductDiscoverResponse.toDiscoverResponse({ lcoalizedField: business.name, items: businessProducts, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.TOP_BUSINESS_PRODUCTS, sequence: 0 });
                return discoverResponse;
            }),
        );
        return topProductResponse
    }

    async getTopBusinessBundles(businessId: string[], limit: number): Promise<BundleDiscoverResponse[]> {
        let businessIds = await this.businessRepo.findBusinessesById(businessId);
        let topProductResponse = await Promise.all(
            businessIds.map(async (business) => {
                const businessBundles = await this.productBundleRepo.getBusinessBundles(business.id, { limit: limit });
                const discoverResponse = BundleDiscoverResponse.toDiscoverResponse({ lcoalizedField: business.name, items: businessBundles, selectedLanguage: LanguageKey.ENGLISH, sequence: 1, discoverType: DiscoverTypes.TOP_BUSINESS_BUNDLES });
                return discoverResponse;
            }),
        );
        return topProductResponse
    }
}