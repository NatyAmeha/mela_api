import { Inject, Injectable } from "@nestjs/common";
import { IBundleRepository, ProductBundleRepository } from "./repo/bundle..repository";
import { BundleResponse, BundleResponseBuilder } from "./dto/bundle_response";
import { ProductBundle } from "./model/product_bundle.model";
import { CreateBundleInput } from "./dto/product_bundle.input";

@Injectable()
export class BundleService {
    constructor(@Inject(ProductBundleRepository.injectName) private bundleRepository: IBundleRepository) { }

    async createProductBundle(businessId: string, branchIds: string[], bundleInputData: CreateBundleInput): Promise<BundleResponse> {
        const bundleInfo = ProductBundle.fromCreateBundleInput({ businessId, branchIds, input: bundleInputData })
        const result = await this.bundleRepository.createBundle(bundleInfo)
        return new BundleResponseBuilder().withBundle(result).build()
    }

}