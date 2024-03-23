import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Product } from "./model/product.model";
import { ProductService } from "./product.service";
import { CreateProductInput, UpdateProductInput } from "./dto/product.input";
import { ProductResponse } from "./model/product.response";
import { Branch } from "../branch/model/branch.model";
import { BranchService } from "../branch/usecase/branch.service";
import { BusinessService } from "../business/usecase/business.service";
import { Business } from "../business/model/business.model";

@Resolver(of => Product)
export class ProductResolver {
    constructor(private productService: ProductService, private businessService: BusinessService, private branchService: BranchService) {
    }

    @Mutation(returns => ProductResponse)
    async createProduct(@Args('product') product: CreateProductInput): Promise<ProductResponse> {
        var productResult = await this.productService.createProduct(product);
        return {
            success: true,
            product: productResult
        }
    }

    @Mutation(returns => ProductResponse)
    async updateProduct(@Args('productId') productId: string, @Args('product') product: UpdateProductInput): Promise<ProductResponse> {
        var productResult = await this.productService.updateProduct(productId, product.getProductInfoToBeUpdated());
        return {
            success: true,
            product: productResult
        }
    }

    @Mutation(returns => ProductResponse)
    async addProductToBranch(@Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.addProductToBranch(productId, branchId);
        return {
            success: true,
            products: updatedProducts
        }
    }

    @Mutation(returns => ProductResponse)
    async removeProductFromBranch(@Args('productIds', { type: () => [String] }) productId: string[], @Args('branchIds', { type: () => [String] }) branchId: string[]): Promise<ProductResponse> {
        var updatedProducts = await this.productService.removeProductFromBranch(productId, branchId);
        return {
            success: true,
            products: updatedProducts
        }
    }

    // ------------------ Nested Queries ------------------

    // responsd for nested query of business from product type
    @ResolveField('business', returns => Business)
    async getBusinessForProduct(@Parent() product: Product): Promise<Business> {
        return await this.businessService.getProductBusiness(product.id);
    }

    // responsd for nested query of branches for product  from product type
    @ResolveField('branches', returns => [Branch])
    async branches(@Parent() product: Product): Promise<Branch[]> {
        return await this.branchService.getProductBranchs(product.id);
    }


}