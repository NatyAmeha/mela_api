import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ProductBundle } from "../model/product_bundle.model";
import { PrismaClient } from "apps/core/prisma/generated/prisma_auth_client";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface IBundleRepository {
    createBundle(bundle: ProductBundle): Promise<ProductBundle>
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

    async onModuleDestroy() {
        await this.$disconnect();
    }
}