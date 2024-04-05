import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Staff } from "./model/staff.model";
import { StaffResponse } from "./model/staff.response";
import { StaffService } from "./staff.service";
import { CreateStaffInput } from "./dto/staff.input";
import { BusinessService } from "../business/usecase/business.service";
import { Business } from "../business/model/business.model";
import { BranchService } from "../branch/usecase/branch.service";
import { Branch } from "../branch/model/branch.model";

@Resolver(of => Staff)
export class StaffResolver {

    constructor(
        private staffService: StaffService,
        private businessService: BusinessService,
        private branchService: BranchService
    ) {
    }


    @Mutation(returns => StaffResponse)
    async createStaff(@Args('staffInput') staffInfo: CreateStaffInput): Promise<StaffResponse> {
        const staff = await this.staffService.createStaff(staffInfo);
        return {
            success: true,
            staff: staff
        }
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
        const staffs = await this.staffService.getBranchStaffs(branchId);
        return {
            success: true,
            staffs: staffs
        }
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