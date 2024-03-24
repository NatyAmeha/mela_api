import { Inject, Injectable } from "@nestjs/common";
import { IStaffRepository, StaffRepository } from "./repo/staff.repo";

@Injectable()
export class StaffService {
    constructor(@Inject(StaffRepository.injectName) private staffRepo: IStaffRepository) {
    }

    async createStaff(staffInfo: any) {
        return await this.staffRepo.createStaff(staffInfo);
    }

    async assignStaffToBranch(branchId: string, staffId: string) {
        return await this.staffRepo.assignStaffToBranch(branchId, staffId);
    }

    async assignStaffToBusiness(businessId: string, staffId: string) {
        return await this.staffRepo.assignStaffToBusiness(businessId, staffId);
    }

    async unAssignStaffFromBranch(branchId: string, staffId: string) {
        return await this.staffRepo.unAssignStaffFromBranch(branchId, staffId);
    }

    async unAssignStaffFromBusiness(businessId: string, staffId: string) {
        return await this.staffRepo.unAssignStaffFromBusiness(businessId, staffId);
    }

    async updateStaffInfo(staffId: string, staffInfo: any) {
        return await this.staffRepo.updateStaffInfo(staffId, staffInfo);
    }

    async changeStaffPIN(staffId: string, newPin: number) {
        return await this.staffRepo.updateStaffInfo(staffId, { pin: newPin });
    }

    async getBusinessStaffs(businessId: string) {
        return await this.staffRepo.getBusinessStaffs(businessId);
    }

    async getBranchStaffs(branchId: string) {
        return await this.staffRepo.getBranchStaffs(branchId);
    }

}