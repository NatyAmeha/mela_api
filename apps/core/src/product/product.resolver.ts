import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Product } from "./model/product.model";
import { ProductService } from "./product.service";
import { CreateProductInput, UpdateProductInput } from "./dto/product.input";
import { ProductResponse } from "./model/product.response";

@Resolver(of => Product)
export class ProductResolver {
    constructor(private productService: ProductService) {
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
}