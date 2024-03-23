import { Inject, Injectable } from "@nestjs/common";
import { IProductRepository, ProductRepository } from "./repo/product.repository";
import { CreateProductInput } from "./dto/product.input";
import { Product } from "./model/product.model";

@Injectable()
export class ProductService {
    constructor(@Inject(ProductRepository.injectName) private productRepository: IProductRepository) {
    }
    async createProduct(productInput: CreateProductInput) {
        return this.productRepository.createProduct(productInput.toProduct());
    }

    async updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product> {
        return this.productRepository.updateProduct(productId, productInfo);
    }

    async addProductToBranch(productId: string[], branchId: string[]): Promise<Product[]> {
        return await this.productRepository.addProductToBranch(productId, branchId);
    }

    async removeProductFromBranch(productId: string[], branchId: string[]): Promise<Product[]> {
        return await this.productRepository.removeProductFromBranch(productId, branchId);
    }

    async getBranchProducts(branchId: string): Promise<Product[]> {
        return await this.productRepository.getBranchProducts(branchId);
    }

    async getBusinessProducts(businessId: string): Promise<Product[]> {
        return await this.productRepository.getBusinessProducts(businessId);
    }
}