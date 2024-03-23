import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Product } from "../model/product.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";

export interface IProductRepository {
    createProduct(product: Product): Promise<Product>;
    updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product>;

}

@Injectable()
export class ProductRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IProductRepository {
    static injectName = "ProductRepository";

    async onModuleInit() {
        this.$connect();
    }

    async createProduct(product: Product): Promise<Product> {
        const createdProduct = await this.$transaction(async (prisma) => {
            const { businessId, branchIds, ...productData } = product;
            const result = await prisma.product.create({
                data: {
                    ...productData,
                    business: {
                        connect: {
                            id: product.businessId
                        },
                    },
                    branches: {
                        connect: product.branchIds.map((id) => ({ id }))
                    }
                }
            });
            return result;
        });

        return new Product({ ...createdProduct });
    }

    async updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product> {
        const { businessId, business, branches, branchIds, ...productData } = productInfo;
        const result = await this.product.update({
            where: { id: productId },
            data: { ...productData }
        });
        return new Product({ ...result });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}