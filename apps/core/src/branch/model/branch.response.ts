import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Branch } from "./branch.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";
import { Business } from "../../business/model/business.model";
import { PriceList } from "../../product/model/price_list_.model";
import { ProductBundle } from "../../product/model/product_bundle.model";

@ObjectType()
export class BranchResponse extends BaseResponse {
    @Field(types => Branch)
    branch?: Branch;
    @Field(types => [Product])
    products?: Product[]
    @Field(types => Business)
    business?: Business
    @Field(types => [PriceList])
    priceList?: PriceList[]

    @Field(types => [ProductBundle])
    bundles?: ProductBundle[]


    @Field(types => [Branch])
    branches?: Branch[];
}

export class BranchResponseBuilder extends BaseResponseBuilder {

    constructor(private branchResponse = new BranchResponse()) {
        super(branchResponse);
    }

    withBranch(branch: Branch): BranchResponseBuilder {
        this.branchResponse.success = true
        this.branchResponse.branch = branch;
        return this;
    }

    withProducts(products: Product[]): BranchResponseBuilder {
        this.branchResponse.products = products;
        return this;
    }

    withBranches(branches: Branch[]): BranchResponseBuilder {
        this.branchResponse.branches = branches;
        return this;
    }

    withBusinesses(business: Business): BranchResponseBuilder {
        this.branchResponse.business = business;
        return this;
    }

    withPriceList(priceList: PriceList[]): BranchResponseBuilder {
        this.branchResponse.branch.priceLists = priceList;
        return this;
    }

    withBundles(bundles: ProductBundle[]): BranchResponseBuilder {
        this.branchResponse.bundles = bundles;
        return this;
    }



    build(): BranchResponse {
        return this.branchResponse;
    }

}