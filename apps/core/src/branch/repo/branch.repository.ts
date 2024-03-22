import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Branch } from "../model/branch.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IBranchRepository {
    addBranchToBusiness(businessId: string, branchData: Branch): Promise<Branch>;
    updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch>;
}

@Injectable()
export class BranchRepository extends PrismaClient implements IBranchRepository, OnModuleInit, OnModuleDestroy {
    static injectName = "BranchRepository";

    async onModuleInit() {
        await this.$connect();
    }

    async addBranchToBusiness(bId: string, branchData: Branch): Promise<Branch> {
        const { productIds, products, staffs, staffsId, businessId, ...restBranchData } = branchData;
        var result = await this.$transaction(async (prisma) => {
            const branch = await prisma.branch.create({
                data: {
                    ...restBranchData,
                    business: { connect: { id: bId } },
                },
            });
            await prisma.business.update({
                where: { id: bId },
                data: { branchIds: { push: branch.id } },
            });
            return branch;
        })
        return new Branch({ ...result });
    }

    async updateBranch(branchId: string, branchData: Partial<Branch>): Promise<Branch> {
        try {
            const { products, staffs, business, ...restBranchData } = branchData;
            var result = await this.branch.update({ where: { id: branchId }, data: { ...restBranchData } });
            if (!result.id) {
                throw new RequestValidationException({ message: "Branch not found" });
            }
            return new Branch({ ...result });
        } catch (error) {
            throw new PrismaException({ source: "Update branch", statusCode: 400, code: error.code, meta: { message: error.meta.message ?? error.meta.cause } })
        }
    }



    async onModuleDestroy() {
        await this.$disconnect();
    }
}