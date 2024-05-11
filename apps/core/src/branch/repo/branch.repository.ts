import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Branch } from "../model/branch.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { Business } from "../../business/model/business.model";
import { CommonBusinessErrorMessages } from "../../utils/const/error_constants";
import { InventoryLocationBuilder } from "../../inventory/model/inventory_location.model";

export interface IBranchRepository {
    addBranchToBusiness(businessId: string, branchData: Branch): Promise<Branch>;
    getBranch(branchId: string): Promise<Branch>;
    updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch>;
    deleteBranch(businessId: string, branchId: string): Promise<Branch>

    getBusinessBranches(businessId: string): Promise<Branch[]>;
    getProductBranchs(productId: string): Promise<Branch[]>;

    getBranchInfoForStaff(staffId: string): Promise<Branch>;
}

@Injectable()
export class BranchRepository extends PrismaClient implements IBranchRepository, OnModuleInit, OnModuleDestroy {
    static injectName = "BranchRepository";

    async onModuleInit() {
        await this.$connect();
    }

    async addBranchToBusiness(bId: string, branchData: Branch): Promise<Branch> {
        const { productIds, products, staffs, staffsId, businessId, inventoryLocations, ...restBranchData } = branchData;
        var result = await this.$transaction(async (prisma) => {
            const branchCreateResult = await prisma.branch.create({
                data: {
                    ...restBranchData,
                    business: { connect: { id: bId } },
                },
            });
            await prisma.business.update({
                where: { id: bId },
                data: { branchIds: { push: branchCreateResult.id } },
            });
            const branchInfo = new Branch({ ...branchCreateResult });
            const inventoryLocationInfo = new InventoryLocationBuilder().fromBranch(branchInfo).build();
            const { branchId, businessId, business, ...locationData } = inventoryLocationInfo;
            await prisma.inventoryLocation.create({
                data: {
                    ...locationData,
                    branch: { connect: { id: branchInfo.id } },
                    business: { connect: { id: branchInfo.businessId } }
                }
            });

            return branchCreateResult;
        })
        return new Branch({ ...result });
    }

    async getBranch(branchId: string): Promise<Branch> {
        try {
            const result = await this.branch.findUnique({ where: { id: branchId } });
            if (!result) {
                throw new RequestValidationException({ message: "Branch not found" });
            }
            return new Branch({ ...result });
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            throw new PrismaException({ source: "Get branch", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async getBusinessBranches(businessId: string): Promise<Branch[]> {
        try {
            const result = await this.business.findUnique({ where: { id: businessId } }).branches();
            return result.map((branch) => new Branch({ ...branch }));
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            throw new PrismaException({ source: "Get business branches", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch> {
        try {
            const { products, staffs, business, businessId, inventoryLocations, ...restBranchData } = branchData;
            var result = await this.branch.update({ where: { id: branchId }, data: { ...restBranchData } });
            if (!result.id) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BRANCH_NOT_FOUND });
            }
            return new Branch({ ...result });
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            throw new PrismaException({ source: "Update branch", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async deleteBranch(businessId: string, branchId: string): Promise<Branch> {
        try {
            const business = await this.business.findUnique({ where: { id: businessId } });
            if (!business) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BUSINESS_NOT_FOUND });
            }

            const branch = await this.branch.findUnique({ where: { id: branchId } });
            if (!branch) {
                throw new RequestValidationException({ message: CommonBusinessErrorMessages.BRANCH_NOT_FOUND });
            }

            const result = await this.$transaction(async (prisma) => {
                if (branch && branch.productIds.length > 0) {
                    for (const productId of branch.productIds) {
                        await prisma.product.update({ where: { id: productId }, data: { branches: { disconnect: [{ id: branchId }] } } })
                    }
                }
                await prisma.business.update({
                    where: { id: businessId },
                    data: { branchIds: { set: business.branchIds.filter(id => id !== branchId) } }
                });
                const deletedBranchInfo = await prisma.branch.delete({ where: { id: branchId } });
                return deletedBranchInfo;
            })
            return new Branch({ ...result });
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            console.log("Error", error)
            throw new PrismaException({ source: "Delete branch", statusCode: 400, code: error.code, meta: { message: error?.meta?.message ?? error?.meta?.cause } })
        }
    }



    async getProductBranchs(productId: string): Promise<Branch[]> {
        try {
            const result = await this.product.findUnique({ where: { id: productId } }).branches();
            return result?.map((branch) => new Branch({ ...branch }));
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            throw new PrismaException({ source: "Get product branches", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }

    async getBranchInfoForStaff(staffId: string): Promise<Branch> {
        try {
            const staff = await this.staff.findUnique({ where: { id: staffId } });
            if (!staff) {
                throw new RequestValidationException({ message: "Staff not found", statusCode: 404 });
            }
            const branch = await this.branch.findUnique({ where: { id: staff.branchId } });
            if (!branch) {
                throw new RequestValidationException({ message: "Branch not found", statusCode: 404 });
            }
            return new Branch({ ...branch });
        } catch (error) {
            if (error instanceof RequestValidationException) throw error;
            throw new PrismaException({ source: "Get branch info for staff", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }


    async onModuleDestroy() {
        await this.$disconnect();
    }
}