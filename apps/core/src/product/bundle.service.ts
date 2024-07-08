import { Inject, Injectable } from "@nestjs/common";
import { IBundleRepository, ProductBundleRepository } from "./repo/bundle.repository";
import { BundleResponse, BundleResponseBuilder } from "./dto/bundle_response";
import { ProductBundle } from "./model/product_bundle.model";
import { CreateBundleInput, UpdateBundleInput } from "./dto/product_bundle.input";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class BundleService {
    constructor(@Inject(ProductBundleRepository.injectName) private bundleRepository: IBundleRepository) { }

    async createProductBundle(businessId: string, branchIds: string[], bundleInputData: CreateBundleInput): Promise<BundleResponse> {
        const bundleInfo = ProductBundle.fromCreateBundleInput({ businessId, branchIds, input: bundleInputData })
        const result = await this.bundleRepository.createBundle(bundleInfo)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async updateBundleInfo(businessId: string, bundleId: string, bundle: UpdateBundleInput): Promise<BundleResponse> {
        const bundleInfo = await ProductBundle.fromUpdateBundleInput(businessId, bundle)
        const result = await this.bundleRepository.updateBundleInfo(bundleId, bundleInfo)
        return new BundleResponseBuilder().withBundle(result).build()
    }

    async getBundleDetails(bundleId: string): Promise<BundleResponse> {
        const result = await this.bundleRepository.getBundleDetails(bundleId)
        return new BundleResponseBuilder().withBundle(result).build()
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

}