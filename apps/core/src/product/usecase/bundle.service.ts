import { Inject, Injectable } from "@nestjs/common";
import { IBundleRepository, ProductBundleRepository } from "../repo/bundle.repository";
import { BundleResponse, BundleResponseBuilder } from "../dto/bundle_response";
import { ProductBundle } from "../model/product_bundle.model";
import { CreateBundleInput, UpdateBundleInput } from "../dto/product_bundle.input";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ProductService } from "./product.service";
import { IProductRepository, ProductRepository } from "../repo/product.repository";
import { BusinessRepository } from "../../business/repo/business.repo";
import { IBusinessRepository } from "../../business/repo/business.repo";
import { Business } from "../../business/model/business.model";

@Injectable()
export class BundleService {
    constructor(
        @Inject(ProductBundleRepository.injectName) private bundleRepository: IBundleRepository,
        @Inject(ProductRepository.injectName) private productRepo: IProductRepository,
        @Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository
    ) { }

    async createProductBundle(businessId: string[], branchIds: string[], bundleInputData: CreateBundleInput): Promise<BundleResponse> {
        const bundleInfo = ProductBundle.fromCreateBundleInput({ businessId, branchIds, input: bundleInputData })
        const result = await this.bundleRepository.createBundle(bundleInfo)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async updateBundleInfo(businessId: string[], bundleId: string, bundle: UpdateBundleInput): Promise<BundleResponse> {
        const bundleInfo = await ProductBundle.fromUpdateBundleInput(businessId, bundle)
        const result = await this.bundleRepository.updateBundleInfo(bundleId, bundleInfo)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async getBundleDetails(bundleId: string): Promise<BundleResponse> {
        let bundleReesult = await this.bundleRepository.getBundleDetails(bundleId)
        // const products = await this.productRepo.getProductsById(bundleReesult.productIds)
        // products = await this.productService.addSelectedPricesToProducts(products, {}) 
        return new BundleResponseBuilder().withBundle(bundleReesult).build()
    }

    async addProductToBundle(bundleId: string, productIds: string[]): Promise<BundleResponse> {
        const result = await this.bundleRepository.addProductToBundle(bundleId, productIds)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async removeProductFromBundle(bundleId: string, productIds: string[]): Promise<BundleResponse> {
        const result = await this.bundleRepository.removeProductFromBundle(bundleId, productIds)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async addBundleToBranch(bundleId: string, branchIds: string[]): Promise<BundleResponse> {
        const result = await this.bundleRepository.assignBundleToBranch(bundleId, branchIds)
        return new BundleResponseBuilder().basicResponse(true);
    }

    async removeBundleFromBranch(bundleId: string, branchIds: string[]): Promise<BundleResponse> {
        const result = await this.bundleRepository.unassignBundleFromBranch(bundleId, branchIds)
        return new BundleResponseBuilder().basicResponse(true);
    }

    async deleteBundle(bundleId: string): Promise<BundleResponse> {
        const result = await this.bundleRepository.deleteBundle(bundleId)
        return new BundleResponseBuilder().withBundle(result).build();
    }

    async getBusinessBundles(businessId: string[], branchId?: string): Promise<ProductBundle[]> {
        if (branchId != null) {
            return await this.bundleRepository.getBundlesAvailableInBranch(branchId)
        }
        return await this.bundleRepository.getBusinessBundles(businessId, { limit: 20 })
    }

    async getBundleBusinesses(businessIds: string[]): Promise<Business[]> {
        const result = await this.businessRepo.findBusinessesById(businessIds)
        return result
    }

}