import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Product } from "../model/product.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IProductRepository {
    createProduct(product: Product): Promise<Product>;
    updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product>;

    addProductToBranch(productId: string[], branchId: string[]): Promise<Product[]>;
    removeProductFromBranch(productId: string[], branchId: string[]): Promise<Product[]>;

    getBranchProducts(branchId: string): Promise<Product[]>;
    getBusinessProducts(businessId: string): Promise<Product[]>;


}

@Injectable()
export class ProductRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IProductRepository {
    static injectName = "ProductRepository";

    async onModuleInit() {
        this.$connect();
    }

    async createProduct(product: Product): Promise<Product> {
        try {
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
                            connect: product.branchIds?.map((id) => ({ id }))
                        }
                    }
                });
                return result;
            });

            return new Product({ ...createdProduct });
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Create product", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product> {
        try {
            const { businessId, business, branches, branchIds, ...productData } = productInfo;
            const result = await this.product.update({
                where: { id: productId },
                data: { ...productData }
            });
            return new Product({ ...result });
        } catch (error) {
            throw new PrismaException({ source: "Update product", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async addProductToBranch(productIds: string[], branchId: string[]): Promise<Product[]> {
        try {
            const updatedProducts = await this.$transaction(
                productIds?.map(productId =>
                    this.product.update({
                        where: { id: productId },
                        data: {
                            branches: {
                                connect: branchId?.map(id => ({ id })),
                            },
                        },
                    })
                )
            );
            return updatedProducts?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Add product to branch", statusCode: 400, code: error.code, meta: error.meta });
        }

    }

    async removeProductFromBranch(productIds: string[], branchIds: string[]): Promise<Product[]> {
        try {
            const updatedProducts = await this.$transaction(productIds?.map(pId => {
                return this.product.update({
                    where: { id: pId },
                    data: {
                        branches: { disconnect: branchIds?.map(id => ({ id })) }
                    },
                });
            }));
            return updatedProducts?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Remove product from branch", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBranchProducts(branchId: string): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: {
                    branches: {
                        some: {
                            id: branchId
                        }
                    }
                }
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Get branch products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBusinessProducts(businessId: string): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: {
                    businessId: businessId
                }
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Get business products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}