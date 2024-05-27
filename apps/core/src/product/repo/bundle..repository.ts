import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ProductBundle } from "../model/product_bundle.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { uniq } from "lodash";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";

export interface IBundleRepository {
    createBundle(bundle: ProductBundle): Promise<ProductBundle>
    getBundle(bundleId: string): Promise<ProductBundle>
    getBundlesAvailableInBranch(branchId: string): Promise<ProductBundle[]>
    getBusinessBundles(businessId: string): Promise<ProductBundle[]>
    updateBundleInfo(bundleId: string, bundle: Partial<ProductBundle>): Promise<ProductBundle>
    addProductToBundle(bundleId: string, productId: string[]): Promise<ProductBundle>
    removeProductFromBundle(bundleId: string, productId: string[]): Promise<ProductBundle>
    assignBundleToBranch(bundleId: string, branchId: string[]): Promise<ProductBundle>
    unassignBundleFromBranch(bundleId: string, branchId: string[]): Promise<ProductBundle>
    deleteBundle(bundleId: string): Promise<ProductBundle>
}
@Injectable()
export class ProductBundleRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, IBundleRepository {

    static injectName = "ProductBundleRepository";

    async onModuleInit() {
        await this.$connect();
    }

    async createBundle(bundle: ProductBundle): Promise<ProductBundle> {
        try {
            const { business, branches, branchIds, businessId, products, ...restBundleInfo } = bundle;
            const result = await this.$transaction(async (prisma) => {
                const bundleCreateResult = await prisma.bundle.create({
                    data: {
                        ...restBundleInfo,
                        business: { connect: { id: businessId } },
                        branches: { connect: branchIds.map(branchId => ({ id: branchId })) },
                    }
                });
                return bundleCreateResult;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ source: "Create product", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async getBundle(bundleId: string): Promise<ProductBundle> {
        try {
            const result = await this.bundle.findUnique({ where: { id: bundleId } });
            if (!result.id) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })
            }
            return new ProductBundle({ ...result });
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Get bundle", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async getBundlesAvailableInBranch(branchId: string): Promise<ProductBundle[]> {
        try {
            const result = await this.bundle.findMany({
                where: { branches: { some: { id: branchId } } }
            });
            return result?.map(bundle => new ProductBundle({ ...bundle }));
        } catch (ex) {
            throw new PrismaException({ source: "Get bundles available in branch", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async getBusinessBundles(businessId: string): Promise<ProductBundle[]> {
        try {
            const result = await this.bundle.findMany({
                where: { businessId }
            });
            return result?.map(bundle => new ProductBundle({ ...bundle }));
        } catch (ex) {
            throw new PrismaException({ source: "Get business bundles", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }



    async addProductToBundle(bundleId: string, productId: string[]): Promise<ProductBundle> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
                if (!bundle) {
                    if (!result.id) {
                        throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })
                    }
                }
                const newProductIds = [...bundle.productIds, ...productId]
                const uniqueProductIds = uniq(newProductIds);
                const updatedBundle = await prisma.bundle.update({
                    where: { id: bundleId },
                    data: {
                        productIds: uniqueProductIds
                    }
                });
                return updatedBundle;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Add product to bundle", statusCode: 400 });
        }
    }

    async removeProductFromBundle(bundleId: string, productId: string[]): Promise<ProductBundle> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
                if (!bundle) {
                    throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })

                }
                const newProductIds = bundle.productIds.filter(id => !productId.includes(id));
                const updatedBundle = await prisma.bundle.update({
                    where: { id: bundleId },
                    data: {
                        productIds: newProductIds
                    }
                });
                return updatedBundle;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Remove product from bundle", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async assignBundleToBranch(bundleId: string, branchId: string[]): Promise<ProductBundle> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
                if (!bundle) {
                    throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })
                }
                const branchResult = await prisma.branch.findMany({ where: { id: { in: branchId } } });
                if (branchResult.length == 0) {
                    throw new RequestValidationException({ message: CommonBusinessErrorMessages.UANBLE_TO_FIND_BRANCHS, statusCode: 400 })
                }
                const updatedBundle = await prisma.bundle.update({
                    where: { id: bundleId },
                    data: {
                        branches: { connect: branchResult.map(branch => ({ id: branch.id })) }
                    }
                });
                return updatedBundle;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            console.log("ex", ex)
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Assign bundle to branch", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async unassignBundleFromBranch(bundleId: string, branchId: string[]): Promise<ProductBundle> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
                if (!bundle) {
                    throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })
                }
                const updatedBundle = await prisma.bundle.update({
                    where: { id: bundleId },
                    data: {
                        branches: { disconnect: branchId.map(id => ({ id })) }
                    }
                });
                return updatedBundle;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Unassign bundle from branch", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async updateBundleInfo(bundleId: string, bundle: Partial<ProductBundle>): Promise<ProductBundle> {
        try {
            const { business, branches, branchIds, products, ...restBundleInfo } = bundle;
            const result = await this.bundle.update({
                where: { id: bundleId },
                data: { ...restBundleInfo }
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ source: "Update bundle", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async deleteBundle(bundleId: string): Promise<ProductBundle> {
        try {
            const result = await this.$transaction(async (prisma) => {
                const bundle = await prisma.bundle.findUnique({ where: { id: bundleId } });
                if (!bundle) {
                    throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUNDLE_NOT_FOUND, statusCode: 400 })
                }
                const businessUpdate = await prisma.business.update({
                    where: { id: bundle.businessId },
                    data: { bundles: { disconnect: { id: bundleId } } }
                })

                const disconnectBranchFromBundle = await prisma.bundle.update({
                    where: { id: bundleId },
                    data: {
                        branches: { disconnect: bundle.branchIds.map(id => ({ id })) },
                    }
                });
                const deletedBundle = await prisma.bundle.delete(
                    { where: { id: bundleId }, },
                );
                return deletedBundle;
            });
            return new ProductBundle({ ...result });
        } catch (ex) {
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ source: "Delete bundle", statusCode: 400, code: ex?.code, meta: ex?.meta });
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}