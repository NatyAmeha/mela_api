import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Customer } from "./model/customer.model";
import { CustomerService } from "./customer.service";
import { RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";
import { UseGuards } from "@nestjs/common";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { CustomerResponse } from "./model/customer.response";
import { CreateCustomerInput } from "./dto/customer.input";

@Resolver(of => Customer)
export class CustomerResolver {
    constructor(private customerUsecase: CustomerService) { }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.CUSTOMER, action: PERMISSIONACTION.CREATE },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Mutation(returns => CustomerResponse)
    async addBusinessCustomers(@Args("businessId") businessId: string, @Args({ name: "customers", type: () => [CreateCustomerInput] }) customers: CreateCustomerInput[]): Promise<CustomerResponse> {
        const result = await this.customerUsecase.addCustomers(businessId, customers);
        return result
    }


    // @RequiresPermission({
    //     permissions: [
    //         { resourceType: AppResources.POS, action: PERMISSIONACTION.ANY },
    //         { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
    //     ],
    // })
    // @UseGuards(PermissionGuard)
    @Query(returns => CustomerResponse)
    async getBusinessCustomers(@Args("businessId") businessId: string, @Args("page") page: number, @Args("limit") limit: number): Promise<CustomerResponse> {
        const result = await this.customerUsecase.getBusinessCustomers(businessId, page, limit);
        return result;
    }

    @RequiresPermission({
        permissions: [
            { resourceType: AppResources.CUSTOMER, action: PERMISSIONACTION.READ },
            { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" }
        ],
    })
    @UseGuards(PermissionGuard)
    @Query(returns => CustomerResponse)
    async getCustomerDetails(@Args("userId") userId: string, @Args("businessId") businessId: string): Promise<CustomerResponse> {
        const result = await this.customerUsecase.getCustomerDetails(userId, businessId);
        return result;
    }

}
