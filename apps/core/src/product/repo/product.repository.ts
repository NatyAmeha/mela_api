import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Product } from "../model/product.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { result } from "lodash";

export interface IProductRepository {
    createProduct(product: Product): Promise<Product>;
    getProductById(productId: string): Promise<Product>;
    getProductsById(productId: string[]): Promise<Product[]>;
    updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product>;

    addProductToBranch(productId: string[], branchId: string[]): Promise<Product[]>;
    removeProductFromBranch(productId: string[], branchId: string[]): Promise<Product[]>;

    getBranchProducts(branchId: string): Promise<Product[]>;
    getBusinessProducts(businessId: string, query: QueryHelper<Product>): Promise<Product[]>;
    createProductsWithVariants(products: Product[]): Promise<Product[]>;


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
                const { businessId, branchIds, inventory, ...productData } = product;
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

    async getProductById(productId: string): Promise<Product> {
        try {
            const product = await this.product.findUnique({
                where: { id: productId },
            });
            return new Product({ ...product });
        } catch (error) {
            throw new PrismaException({ source: "Get product by id", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getProductsById(productIds: string[]): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: {
                    id: { in: productIds }
                }
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Get products by id", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async createProductsWithVariants(products: Product[]): Promise<Product[]> {
        try {
            const createdProducts = await this.$transaction(async (prisma) => {
                const productResults = await Promise.all(products?.map(async (product) => {
                    const { businessId, branchIds, inventory, ...productData } = product;
                    const { inventoryLocation, inventoryLocationId, ...restInventoryInfo } = inventory[0];
                    return await prisma.product.create({
                        data: {
                            ...productData,
                            business: {
                                connect: {
                                    id: product.businessId
                                },
                            },
                            branches: {
                                connect: product.branchIds?.map((id) => ({ id }))
                            },

                            inventory: {
                                create: {
                                    ...restInventoryInfo,
                                    inventoryLocation: {
                                        connect: {
                                            id: inventoryLocationId
                                        }
                                    }

                                }
                            }
                        }
                    });

                }))

                const mainProduct = productResults.find(product => product.mainProduct == true);
                if (mainProduct && productResults.length > 1) {
                    const varaintsId = productResults.filter(product => product.mainProduct == false)?.map(product => product.id);
                    const updateMainProductVariants = await prisma.product.update({
                        where: { id: mainProduct.id },
                        data: {
                            variantsId: varaintsId
                        }
                    });
                }
                return productResults;
            });



            return createdProducts?.map(product => new Product({ ...product }));
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Create bulk products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updateProduct(productId: string, productInfo: Partial<Product>): Promise<Product> {
        try {
            const { businessId, business, branches, branchIds, inventory, ...productData } = productInfo;
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

    async getBusinessProducts(businessId: string, query: QueryHelper<Product>): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: {
                    businessId: businessId
                },
                skip: query?.page ? query.page - 1 * query.limit : 0,
                take: query?.limit,
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