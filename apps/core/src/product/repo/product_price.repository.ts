import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ProductPrice } from "../model/product_price.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { PriceList } from "../model/price_list_.model";

export interface IProductPriceRepository {
    createProductPrice(priceInfo: ProductPrice[]): Promise<ProductPrice[]>;
    createPriceList(businessId: string, priceList: PriceList[]): Promise<boolean>;

    updateProductPrice(priceInfo: ProductPrice[]): Promise<ProductPrice[]>;
    updatePriceList(businessId: string, priceList: PriceList[]): Promise<boolean>;

    getProductPrice(productId: string, { branchId, pricelistId }: { branchId?: string, pricelistId?: string }): Promise<ProductPrice>;
    getProductsPrices(productIds: string[], { branchId, pricelistId }: { branchId?: string, pricelistId?: string }): Promise<ProductPrice[]>;
    getPriceList(businessId: string, branchId?: string): Promise<PriceList[]>;
    deleteProductPrice(priceId: string[]): Promise<boolean>;
    deletePriceList(businessId: string, priceListId: string[]): Promise<boolean>;

}

export class ProductPriceRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IProductPriceRepository {
    static injectName = "ProductPriceRepository";

    async onModuleInit() {
        await this.$connect();
    }

    async createProductPrice(priceInfo: ProductPrice[]): Promise<ProductPrice[]> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const productPriceCreateResult = await Promise.all(priceInfo.map(async (price) => {
                    var productResult = await this.product.findUnique({ where: { id: price.productId } });
                    if (!productResult) {
                        throw new RequestValidationException({ message: "Product not found" });
                    }
                    const { priceList, product, productId, branchId, ...restPrice } = price;
                    const priceCreateResult = await prisma.productPrice.create({
                        data: {
                            ...restPrice,
                            product: { connect: { id: productId } },
                            branch: branchId != null ? { connect: { id: price.branchId } } : undefined,
                        }
                    });
                    return new ProductPrice({ ...priceCreateResult });
                }));
                return productPriceCreateResult;
            })
            return result;
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "ProductPrice" } });
        }
    }

    async getProductPrice(productId: string, { branchId, pricelistId }: { branchId?: string, pricelistId?: string }): Promise<ProductPrice> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const productPriceResult = await prisma.productPrice.findFirst({
                    where: {
                        productId,
                        branchId: branchId != null ? branchId : undefined,
                        priceListId: pricelistId != null ? pricelistId : undefined,
                    }
                });
                if (!productPriceResult) {
                    const defaultPrice = await prisma.productPrice.findFirst({ where: { productId, isDefault: true } });
                    if (defaultPrice) {
                        return new ProductPrice({ ...defaultPrice });
                    }
                    throw new RequestValidationException({ message: "Product price not found" });
                }
                return new ProductPrice({ ...productPriceResult });
            })
            return result;
        } catch (ex) {
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "ProductPrice" } });
        }
    }

    async getProductsPrices(productIds: string[], { branchId, pricelistId }: { branchId?: string; pricelistId?: string; }): Promise<ProductPrice[]> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const productPrices = await prisma.productPrice.findMany({
                    where: {
                        productId: { in: productIds },
                        branchId: branchId != null ? branchId : undefined,
                        priceListId: pricelistId != null ? pricelistId : undefined,
                    }
                })
                return productPrices.map(price => new ProductPrice({ ...price }))
            })
            return result;
        } catch (ex) {
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "ProductPrice" } });
        }
    }



    async createPriceList(businessId: string, priceList: PriceList[]): Promise<boolean> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const priceListCreateResult = await Promise.all(priceList.map(async (pList) => {
                    const businessResult = await prisma.business.findUnique({ where: { id: businessId } });
                    if (!businessResult) {
                        throw new RequestValidationException({ message: "Business not found" });
                    }
                    const existingPriceList = businessResult.priceLists;
                    const isPriceListExist = existingPriceList.some((priceList) => priceList.id === pList.id);
                    if (!isPriceListExist) {
                        await prisma.business.update({ where: { id: businessId }, data: { priceLists: { push: pList } } });

                    }
                    return new PriceList({ ...pList });
                }));
                return true;
            })
            return result;

        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "PriceList" } });
        }
    }

    async getPriceList(businessId: string, branchId?: string): Promise<PriceList[]> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const businessResult = await prisma.business.findUnique({ where: { id: businessId } });
                if (!businessResult) {
                    throw new RequestValidationException({ message: "Business not found" });
                }
                const priceList = businessResult.priceLists;
                if (branchId) {
                    return priceList.filter((priceList) => priceList.branchIds.includes(branchId));
                }
                return priceList;
            })
            return result;
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "PriceList" } });
        }
    }

    async updateProductPrice(priceInfo: ProductPrice[]): Promise<ProductPrice[]> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const productPriceUpdateResult = await Promise.all(priceInfo.map(async (price) => {
                    var productResult = await this.product.findUnique({ where: { id: price.productId }, include: { prices: true } });
                    if (!productResult) {
                        throw new RequestValidationException({ message: "Product not found" });
                    }
                    const productPriceId = productResult.prices.map(priceInfo => priceInfo.id)
                    const isPriceInProductPrice = productPriceId.includes(price.id);
                    if (!isPriceInProductPrice) {
                        throw new RequestValidationException({ message: "Current product price is not part of this product" });
                    }
                    const { id, priceList, product, ...restPrice } = price;
                    const priceUpdateResult = await prisma.productPrice.update({
                        where: { id: id },
                        data: { ...restPrice }
                    });
                    return new ProductPrice({ ...priceUpdateResult });
                }));
                return productPriceUpdateResult;
            })
            return result;
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "ProductPrice" } });
        }
    }

    async updatePriceList(businessId: string, priceList: PriceList[]): Promise<boolean> {
        try {
            const result = await this.$transaction(async (prisma) => {
                // const updatedPriceList: PriceList[] = [];
                const businessResult = await prisma.business.findUnique({ where: { id: businessId } });
                if (!businessResult) {
                    throw new RequestValidationException({ message: "Business not found" });
                }
                const businessPriceLists = businessResult.priceLists ?? []
                await Promise.all(priceList.map(async (pList) => {
                    const index = businessPriceLists?.findIndex((priceList) => priceList.id == pList.id);
                    if (index !== -1) {
                        businessPriceLists[index] = { ...businessPriceLists[index], ...pList };
                    }
                }));
                if (businessPriceLists.length > 0) {
                    await prisma.business.update({ where: { id: businessId }, data: { priceLists: { set: businessPriceLists } } });

                }
                return true;
            })
            return result;

        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "PriceList" } });
        }
    }


    async deleteProductPrice(priceId: string[]): Promise<boolean> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const productPriceDeleteResult = await Promise.all(priceId.map(async (id) => {
                    const priceInfo = await prisma.productPrice.findUnique({ where: { id } });
                    if (!priceInfo) {
                        throw new RequestValidationException({ message: "Price not found" });
                    }
                    if (priceInfo.isDefault) {
                        throw new RequestValidationException({ message: "Default price cannot be deleted" });
                    }
                    await prisma.productPrice.delete({ where: { id } });
                    return true;
                }));
                return true;
            })
            return result;
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "ProductPrice" } });
        }
    }

    async deletePriceList(businessId: string, priceListId: string[]): Promise<boolean> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const priceListDeleteResult = await Promise.all(priceListId.map(async (id) => {
                    const businessResult = await prisma.business.findUnique({ where: { id: businessId } });
                    if (!businessResult) {
                        throw new RequestValidationException({ message: "Business not found" });
                    }
                    const existingPriceList = businessResult.priceLists;
                    const isPriceListExist = existingPriceList.findIndex((priceList) => priceList.id === id);
                    if (isPriceListExist !== -1) {
                        const updatedPriceList = existingPriceList.filter((priceList) => priceList.id !== id);
                        await prisma.business.update({ where: { id: businessId }, data: { priceLists: { set: updatedPriceList } } });

                    }
                    return true;
                }));
                return true;
            })
            return result;

        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            console.log(ex);
            throw new PrismaException({ message: ex.message, meta: { modelName: "PriceList" } });
        }
    }





    async onModuleDestroy() {
        await this.$disconnect();
    }

}