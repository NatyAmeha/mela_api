import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Product } from "../model/product.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { result, uniq } from "lodash";
import { ProductAddon } from "../model/product_addon.model";
import { CommonBusinessErrorMessages, CommonProductErrorMessages } from "../../utils/const/error_constants";
import { Stat } from "../model/product_stat.model";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

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

    // Productd addon
    createProductAddon(productId: string, productAddon: ProductAddon[]): Promise<boolean>;
    getProductAddons(productId: string): Promise<ProductAddon[]>;
    updateProductAddon(productId: string, productAddonInfo: ProductAddon[]): Promise<boolean>;
    deleteAllProductAddon(productId: string): Promise<boolean>;
    deleteProductAddon(productId: string, productAddonId: string): Promise<boolean>;

    // Payment option
    assignPaymentOptionToProduct(productId: string, paymentOptionId: string[]): Promise<boolean>;
    removePaymentOptionFromProduct(productId: string, paymentOptionId: string[]): Promise<boolean>;

    updateProductStats(productId: string, stats: Partial<Stat>): Promise<boolean>;


    addMembershipIdToProducts(productIds: string[], membershipId: string): Promise<boolean>;
    removeMembershipIdFromProducts(productIds: string[], membershipId: string): Promise<boolean>;
    getMembershipProducts(membershipId: string): Promise<Product[]>;

    //discovery
    queryProducts(queryHelper: QueryHelper<Product>): Promise<Product[]>
    getBusinessTopProducts(businessId: string, query: QueryHelper<Product>): Promise<Product[]>;


}

@Injectable()
export class ProductRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IProductRepository {
    static injectName = "ProductRepository";

    async onModuleInit() {
        this.$connect();
    }

    async updateProductStats(productId: string, stats: Partial<Stat>): Promise<boolean> {
        try {
            // for now, only update the product view counter
            const result = await this.product.update({
                where: { id: productId },
                data: {
                    totalViews: stats.totalViews
                }
            });
            return true;
        } catch (error) {
            throw new PrismaException({ source: "Update product stats", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async createProduct(product: Product): Promise<Product> {
        try {
            const createdProduct = await this.$transaction(async (prisma) => {
                const { businessId, branchIds, inventory, prices, ...productData } = product;
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
                    const { businessId, branchIds, inventory, prices, ...productData } = product;
                    const { inventoryLocation, inventoryLocationId, ...restInventoryInfo } = inventory[0];
                    const productCreateResult = await prisma.product.create({
                        data: {
                            ...productData,
                            business: {
                                connect: { id: product.businessId },
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
                            },
                            prices: { create: prices }
                        }
                    });
                    return productCreateResult;

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
            const { businessId, business, branches, branchIds, inventory, addons, prices, ...productData } = productInfo;
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
                skip: query?.page ? ((query.page - 1) * query.limit) : 0,
                take: query?.limit,
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Get business products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async createProductAddon(productId: string, productAddon: ProductAddon[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product?.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Create product addon", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const result = await prisma.product.update({
                    where: { id: productId },
                    data: {
                        addons: { push: productAddon }
                    }
                });
                return true;
            });
            return transactionResult;
        } catch (error) {
            throw new PrismaException({ source: "Create product addon", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getProductAddons(productId: string): Promise<ProductAddon[]> {
        try {
            const product = await this.product.findFirst({
                where: { id: productId },
                select: { addons: true }
            });
            return product.addons?.map(addon => new ProductAddon({ ...addon }));
        } catch (error) {
            throw new PrismaException({ source: "Get product addons", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async updateProductAddon(productId: string, productAddonInfo: ProductAddon[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Update product addon", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const updatedAddons = productResult.addons?.map(existingAddon => {
                    const updatedAddon = productAddonInfo?.find((addonInfo) => existingAddon.id == addonInfo.id);
                    return updatedAddon ? { ...existingAddon, ...updatedAddon } : existingAddon;
                })
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        addons: updatedAddons
                    }
                });
                return true;

            });
            return transactionResult;
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Update product addon", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async deleteAllProductAddon(productId: string): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product?.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Delete all product addon", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        addons: { set: [] }
                    }
                });
                return true;
            });
            return transactionResult;
        } catch (error) {
            throw new PrismaException({ source: "Delete all product addon", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async deleteProductAddon(productId: string, productAddonId: string): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product?.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Delete product addon", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const updatedAddons = productResult.addons?.filter(addon => addon.id !== productAddonId);
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        addons: { set: updatedAddons }
                    }
                });
                return true;
            });
            return transactionResult;
        } catch (error) {
            throw new PrismaException({ source: "Delete product addon", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async assignPaymentOptionToProduct(productId: string, paymentOptionsId: string[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product?.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Assign payment option to product", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const uniqueOptionsId = uniq([...productResult.paymentOptionsId, ...paymentOptionsId])
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        paymentOptionsId: { set: uniqueOptionsId }
                    }
                });

                return true;
            });
            return transactionResult;
        } catch (error) {
            throw new PrismaException({ source: "Assign payment option to product", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async removePaymentOptionFromProduct(productId: string, paymentOptionsId: string[]): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const productResult = await prisma.product?.findFirst({ where: { id: productId } });
                if (!productResult) {
                    throw new PrismaException({ source: "Remove payment option from product", statusCode: 400, code: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const updatedOptions = productResult.paymentOptionsId?.filter(id => !paymentOptionsId.includes(id));
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        paymentOptionsId: { set: updatedOptions }
                    }
                });
                return true;
            });
            return transactionResult;
        } catch (error) {
            throw new PrismaException({ source: "Remove payment option from product", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getBusinessTopProducts(businessId: string, query: QueryHelper<Product>): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: { businessId },
                orderBy: { ...query.orderBy as any },
                skip: query?.page ? ((query.page - 1) * query.limit) : 0,
                take: query?.limit,
            });
            return products?.map(product => new Product({ ...product }));
        } catch (ex) {
            throw new PrismaException({ source: "Get business top products", statusCode: 400, code: ex.code, meta: ex.meta });
        }
    }

    async addMembershipIdToProducts(productIds: string[], membershipId: string): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const products = await prisma.product.findMany({
                    where: {
                        id: { in: productIds }
                    }
                });
                if (products.length != productIds.length) {
                    throw new RequestValidationException({ source: "Add membership ", statusCode: 400, message: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const updatedProducts = await Promise.all(products.map(product => {
                    const uniqueMembershipIds = uniq([...product.membershipIds, membershipId]);
                    return prisma.product.update({
                        where: { id: product.id },
                        data: {
                            membershipIds: { set: uniqueMembershipIds }
                        }
                    });
                }));
                console.log("update product result ", updatedProducts.length);
                return updatedProducts;
            });
            return true;
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Add membership id to products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async removeMembershipIdFromProducts(productIds: string[], membershipId: string): Promise<boolean> {
        try {
            const transactionResult = await this.$transaction(async (prisma) => {
                const products = await prisma.product.findMany({
                    where: {
                        id: { in: productIds }
                    }
                });
                if (products.length != productIds.length) {
                    throw new RequestValidationException({ source: "Remove membership id from products", statusCode: 400, message: CommonProductErrorMessages.PRODUCT_NOT_FOUND });
                }
                const updatedProducts = products.map(product => {
                    const updatedMembershipIds = product.membershipIds?.filter(id => id !== membershipId);
                    return prisma.product.update({
                        where: { id: product.id },
                        data: {
                            membershipIds: { set: updatedMembershipIds }
                        }
                    });
                });
                return updatedProducts;
            });
            return true;
        } catch (error) {
            console.log("error", error)
            throw new PrismaException({ source: "Remove membership id from products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async getMembershipProducts(membershipId: string): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: {
                    membershipIds: { has: membershipId }
                }
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Get membership products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async queryProducts(queryHelper: QueryHelper<Product>): Promise<Product[]> {
        try {
            const products = await this.product.findMany({
                where: { ...queryHelper.query as any },
                orderBy: {
                    ...queryHelper.orderBy as any
                },
                skip: queryHelper?.page ? ((queryHelper.page - 1) * queryHelper.limit) : 0,
                take: queryHelper?.limit,
            });
            return products?.map(product => new Product({ ...product }));
        } catch (error) {
            throw new PrismaException({ source: "Get popular products", statusCode: 400, code: error.code, meta: error.meta });
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}