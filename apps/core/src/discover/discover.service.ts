import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../business/repo/business.repo";
import { ProductRepository } from "../product/repo/product.repository";
import { IDiscovery, DiscoverTypes } from "./model/discovery_interface.response";
import { Product } from "../product/model/product.model";
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model";
import { ProductBundleRepository } from "../product/repo/bundle.repository";
import { ProductBundle } from "../product/model/product_bundle.model";
import { ForYouResponse, ForYouResponseResponseBuilder as ForYouResponseBuilder } from "./response/foryou.response";
import { BundleDiscovery } from "./model/bundle_discover.model";
import { ProductDiscovery } from "./model/product_discovery";
import { DiscoveryResponse, DiscoveryResponseBuilder } from "./response/discovery.response";
import { BusinessDiscovery } from "./model/business_discovery.model";
import { IProductPriceRepository, ProductPriceRepository } from "../product/repo/product_price.repository";
import { ProductService } from "../product/usecase/product.service";

@Injectable()
export class DiscoverService {
    constructor(
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository,
        @Inject(ProductRepository.injectName) private productRepo: ProductRepository,
        private productService: ProductService,
        @Inject(ProductBundleRepository.injectName) private productBundleRepo: ProductBundleRepository
    ) { }


    async getForYouData(userFavoriteBusinessIds: string[], limit: number): Promise<ForYouResponse> {
        const topProducts = await this.getTopProductsFromUserFavoriteBusinesses(userFavoriteBusinessIds, limit);
        const favoriteBusinesses = await this.businessRepo.findBusinessesById(userFavoriteBusinessIds);
        const topBusinessBundles = await this.getTopBusinessBundles(userFavoriteBusinessIds, limit);
        console.log('topBusinessBundles', topBusinessBundles)
        const result = new ForYouResponseBuilder().withTopProductsByBusiness(topProducts).withFavoriteBusinesses(favoriteBusinesses).withBundles(topBusinessBundles).build();
        return result;
    }



    async getDiscoverData(): Promise<DiscoveryResponse> {
        const topProducts = await this.productRepo.queryProducts({ query: { mainProduct: true }, orderBy: { totalViews: "desc" }, limit: 5 });
        // const topProductsWithPrices = await this.productService.addSelectedPricesToProducts(topProducts, {});
        const topProductDiscoveryResponse = ProductDiscovery.toDiscoverResponse({ lcoalizedField: ProductDiscovery.getTopProductsTitle(), items: topProducts, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.TOP_PRODUCTS, sequence: 0 });

        const newProducts = await this.productRepo.queryProducts({ query: { mainProduct: true }, orderBy: { createdAt: "desc" }, limit: 5 });
        // const newProductsWithPrices = await this.productService.addSelectedPricesToProducts(newProducts, {});
        const newProductDiscoveryResponse = ProductDiscovery.toDiscoverResponse({ lcoalizedField: ProductDiscovery.getNewProductsTitle(), items: newProducts, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.NEW_PRODUCTS, sequence: 1 });

        const topBusinesses = await this.businessRepo.queryBusinesses({ orderBy: { totalViews: "desc" }, limit: 8 });
        const topBusinessDeiscoveryResponse = BusinessDiscovery.toDiscoverResponse({ lcoalizedField: BusinessDiscovery.getTopBusinessTitle(), items: topBusinesses, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.TOP_BUSINESS, sequence: 0 });

        const topBundles = await this.productBundleRepo.queryBundles({ orderBy: { createdAt: "desc" }, limit: 5 });
        const topBundleResponse = BundleDiscovery.toDiscoverResponse({ lcoalizedField: BundleDiscovery.getTopBundlesTitle(), items: topBundles, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.TOP_BUNDLES, sequence: 0 });

        const discoveryResult = new DiscoveryResponseBuilder()
            .withProductsResponse([topProductDiscoveryResponse, newProductDiscoveryResponse])
            .withBusinessesResponse([topBusinessDeiscoveryResponse]).withBundlesResponse([topBundleResponse])
            .build();
        return discoveryResult
    }


    async getTopProductsFromUserFavoriteBusinesses(businessIds: string[], limit: number): Promise<ProductDiscovery[]> {
        const businesses = await this.businessRepo.findBusinessesById(businessIds);
        const topProductResponse = await Promise.all(
            businesses.map(async (business) => {
                let businessProducts = await this.productRepo.getBusinessTopProducts(business.id, { limit: limit });
                // const businessProductsWithPrice = await this.productService.addSelectedPricesToProducts(businessProducts, {});
                let discoverResponse = ProductDiscovery.toDiscoverResponse({ lcoalizedField: business.name, items: businessProducts, selectedLanguage: LanguageKey.ENGLISH, discoverType: DiscoverTypes.TOP_BUSINESS_PRODUCTS, sequence: 0 });
                return discoverResponse;
            }),
        );
        return topProductResponse
    }

    async getTopBusinessBundles(businessId: string[], limit: number): Promise<BundleDiscovery[]> {
        let businessIds = await this.businessRepo.findBusinessesById(businessId);
        let bundleResponse = await Promise.all(
            businessIds.map(async (business) => {
                const businessBundles = await this.productBundleRepo.getBusinessBundles([business.id], { limit: limit });
                const discoverResponse = BundleDiscovery.toDiscoverResponse({ lcoalizedField: business.name, items: businessBundles, selectedLanguage: LanguageKey.ENGLISH, sequence: 1, discoverType: DiscoverTypes.TOP_BUSINESS_BUNDLES });
                return discoverResponse;
            }),
        );
        return bundleResponse
    }
}