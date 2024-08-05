import { BaseResponse, BaseResponseBuilder } from "@app/common/model/base.response";
import { Product } from "./product.model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Branch } from "../../branch/model/branch.model";
import { Business } from "../../business/model/business.model";
import { Inventory } from "../../inventory/model/inventory.model";
import { ProductPrice } from "./product_price.model";

@ObjectType()
export class ProductResponse extends BaseResponse {
    @Field(type => Product)
    product?: Product;

    @Field(type => [Inventory])
    inventories?: Inventory[];

    @Field(type => [Product])
    variants?: Product[];

    @Field(type => [Product])
    products?: Product[];

    @Field(types => [Branch])
    branches?: Branch[]

    @Field(types => Business)
    business?: Business

    @Field(types => ProductPrice)
    selectedProductPrice?: ProductPrice

    @Field(types => [ProductPrice])
    productPrices?: ProductPrice[]



    constructor(data: Partial<ProductResponse>) {
        super()
        Object.assign(this, data)
    }
}


export class ProductResponseBuilder extends BaseResponseBuilder {


    constructor(private productResponse: ProductResponse = new ProductResponse({})) {
        super(productResponse);

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

    withinventories(inventory: Inventory[]): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.inventories = inventory
        return this
    }

    withProductVariants(productVariants: Product[], branchInfo?: Branch): ProductResponseBuilder {
        this.productResponse.success = true
        let result: Product[] = productVariants;
        if (branchInfo) {
            result = productVariants.filter(variant => variant.branchIds.includes(branchInfo?.id));
        }
        this.productResponse.variants = result;
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

    withProductPrices(productPrices: ProductPrice[]): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.productPrices = productPrices
        return this
    }

    withSelectedProductPrice(selectedProductPrice: ProductPrice): ProductResponseBuilder {
        this.productResponse.success = true
        this.productResponse.selectedProductPrice = selectedProductPrice
        return this
    }

    build(): ProductResponse {
        return this.productResponse
    }
}