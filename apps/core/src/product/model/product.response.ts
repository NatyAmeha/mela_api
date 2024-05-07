import { BaseResponse } from "@app/common/model/base.response";
import { Product } from "./product.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Branch } from "../../branch/model/branch.model";
import { Business } from "../../business/model/business.model";

@ObjectType()
export class ProductResponse extends BaseResponse {
    @Field(type => Product)
    product?: Product;
    @Field(type => [Product])
    products?: Product[];

    @Field(types => [Branch])
    branches?: Branch[]

    @Field(types => Business)
    business?: Business

    constructor(data: Partial<ProductResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class ProductResponseBuilder {
    private productResponse: ProductResponse
    constructor() {
        this.productResponse = new ProductResponse({})
    }

    withError(error: string): ProductResponse {
        this.productResponse.success = false
        this.productResponse.message = error
        return this.productResponse;
    }

    withProduct(product: Product): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.product = product
        return this
    }

    withProducts(products: Product[]): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.products = products
        return this
    }

    withBranches(branches: Branch[]): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.branches = branches
        return this
    }

    withBusiness(business: Business): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.business = business
        return this
    }

    build(): ProductResponse {
        return this.productResponse
    }
}