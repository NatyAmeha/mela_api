import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Staff } from "./model/staff.model";
import { StaffResponse } from "./model/staff.response";
import { StaffService } from "./staff.service";
import { CreateStaffInput } from "./dto/staff.input";
import { BusinessService } from "../business/usecase/business.service";
import { Business } from "../business/model/business.model";
import { BranchService } from "../branch/usecase/branch.service";
import { Branch } from "../branch/model/branch.model";
import { CoreServiceMsgBrockerClient } from "../msg_brocker_client/core_service_msg_brocker";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PermissionCheckType, PermissionSelectionCriteria, RequiresPermission } from "@app/common/permission_helper/require_permission.decorator";
import { DefaultRoles } from "apps/auth/src/authorization/model/access.model";
import { UseGuards } from "@nestjs/common";
import { PermissionGuard } from "@app/common/permission_helper/permission.guard";
import { AppResources } from "apps/mela_api/src/const/app_resource.constant";
import { PERMISSIONACTION } from "@app/common/permission_helper/permission_constants";

@Resolver(of => Staff)
export class StaffResolver {

    constructor(
        private staffService: StaffService,
        private businessService: BusinessService,
        private branchService: BranchService,
        private coreServiceMsgBrocker: CoreServiceMsgBrockerClient,

    ) {
    }


    @Mutation(returns => StaffResponse)
    async createStaff(@Args('staffInput') staffInput: CreateStaffInput): Promise<StaffResponse> {
        let staffInfo = CreateStaffInput.toStaff(staffInput);
        if (staffInfo.requireBranchAssignment()) {
            let staffUserAndAccessCreateResult = await this.coreServiceMsgBrocker.sendCreateStaffUserAndAccessMessage(staffInput);
            console.log('staffUserAndAccessCreateResult', staffUserAndAccessCreateResult)
            if (!staffUserAndAccessCreateResult.success) {
                throw new RequestValidationException({ message: staffUserAndAccessCreateResult.message })
            }
            const staffResponse = await this.staffService.createStaff(staffInfo);
            return staffResponse;
        }
    }

    @Mutation(returns => StaffResponse)
    async authenticateStaff(@Args('phoneNumber') phoneNumber: string, @Args('businessId') businessId: string, @Args({ name: "pin", nullable: true }) pin?: number): Promise<StaffResponse> {
        console.log('phoneNumber', phoneNumber, 'businessId', businessId, 'pin', pin)
        const staffResponse = await this.staffService.authenticateStaff(phoneNumber, businessId, pin);
        return staffResponse;
    }

    @Mutation(returns => StaffResponse)
    @RequiresPermission({
        permissions: [{ role: DefaultRoles.MANAGER, }, { role: DefaultRoles.BUSINESS_OWNER },
        { resourceType: AppResources.BUSINESS, action: PERMISSIONACTION.ANY, resourcTargetName: "businessId" },
        { resourceType: AppResources.POS, action: PERMISSIONACTION.ANY, resourcTargetName: "branchId" }],
        selectionCriteria: PermissionSelectionCriteria.ANY,
        checkType: PermissionCheckType.ROLE_AND_PERMISSION
    })
    @UseGuards(PermissionGuard)
    async checkManagerAccessToBranch(@Args('businessId') businessId: string, @Args('branchId') branchId: string, @Args('phoneNumber') phoneNumber: string): Promise<StaffResponse> {
        const staffResponse = await this.staffService.checkManagerAccessToBranch(businessId, branchId, phoneNumber);

        return staffResponse;
    }

    @Query(returns => StaffResponse)
    async getBusinessStaffs(@Args('businessId') businessId: string): Promise<StaffResponse> {
        const staffs = await this.staffService.getBusinessStaffs(businessId);
        return {
            success: true,
            staffs: staffs
        }
    }

    @Query(returns => StaffResponse)
    async getBranchStaffs(@Args('branchId') branchId: string): Promise<StaffResponse> {
        const staffResponse = await this.staffService.getBranchStaffs(branchId);
        return staffResponse;
    }

    @Mutation(returns => StaffResponse)
    async assignStaffToBranch(@Args('branchId') branchId: string, @Args('staffId') staffId: string): Promise<StaffResponse> {
        const staff = await this.staffService.assignStaffToBranch(branchId, staffId);
        return {
            success: true,
            staff: staff
        }
    }

    @Mutation(returns => StaffResponse)
    async assignStaffToBusiness(@Args('businessId') businessId: string, @Args('staffId') staffId: string): Promise<StaffResponse> {
        const staff = await this.staffService.assignStaffToBusiness(businessId, staffId);
        return {
            success: true,
            staff: staff
        }
    }

    @Mutation(returns => StaffResponse)
    async unAssignStaffFromBranch(@Args('branchId') branchId: string, @Args('staffId') staffId: string): Promise<StaffResponse> {
        const staff = await this.staffService.unAssignStaffFromBranch(branchId, staffId);
        return {
            success: true,
            staff: staff
        }
    }

    @Mutation(returns => StaffResponse)
    async unAssignStaffFromBusiness(@Args('businessId') businessId: string, @Args('staffId') staffId: string): Promise<StaffResponse> {
        const staff = await this.staffService.unAssignStaffFromBusiness(businessId, staffId);
        return {
            success: true,
            staff: staff
        }
    }

    // ------------------field resolver for nested queries-------------------

    @ResolveField('business', returns => Business)
    async business(@Parent() staff: Staff) {
        return await this.businessService.getBusinessInfoForStaff(staff.id);
    }

    @ResolveField('branch', returns => Branch)
    async branch(@Parent() staff: Staff) {
        return await this.branchService.getBranchInfoForStaff(staff.id);
    }


}