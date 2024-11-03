import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/core/prisma/generated/prisma_core_client";
import { Staff } from "../model/staff.model";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";

export interface IStaffRepository {
    createStaff(staffInfo: Staff): Promise<Staff>
    authenticateStaff(phoneNumber: string, pin: number, branchId: string, businessId: string): Promise<Staff>
    assignStaffToBranch(branchId: string, staffId: string): Promise<Staff>
    assignStaffToBusiness(businessId: string, staffId: string): Promise<Staff>
    unAssignStaffFromBranch(branchId: string, staffId: string): Promise<Staff>
    unAssignStaffFromBusiness(businessId: string, staffId: string): Promise<Staff>

    updateStaffInfo(staffId: string, staffInfo: Partial<Staff>): Promise<Staff>

    getBusinessStaffs(businessId: string): Promise<Staff[]>
    getBranchStaffs(branchId: string): Promise<Staff[]>
}

@Injectable()
export class StaffRepository extends PrismaClient implements IStaffRepository, OnModuleInit, OnModuleDestroy {
    static injectName = 'STAFF_REPOSITORY'
    async onModuleInit() {
        await this.$connect()
    }

    async createStaff(staffInfo: Staff): Promise<Staff> {
        try {
            const { branchId, businessId, ...basicStaffInfo } = staffInfo;
            const createdStaff = await this.staff.create({
                data: {
                    ...basicStaffInfo,
                    branch: staffInfo.branchId ? { connect: { id: branchId } } : undefined,
                    business: staffInfo.businessId ? { connect: { id: businessId } } : undefined
                }
            });
            return new Staff({ ...createdStaff });
        } catch (error) {
            throw new PrismaException({ source: 'StaffRepository.createStaff', message: error.message, statusCode: 500, exception: error })
        }
    }

    async authenticateStaff(phoneNumber: string, pin: number, branchId: string, businessId: string): Promise<Staff> {
        try {
            const staff = await this.staff.findFirst({
                where: { phoneNumber, pin, branchId, businessId }
            });
            if (!staff) {
                throw new RequestValidationException({ source: 'authenticate Staff', message: 'Invalid phone number, pin, branch or business' })
            }
            return new Staff({ ...staff });
        } catch (error) {
            throw new PrismaException({ source: 'authenticate Staff', message: error.message, statusCode: 500, exception: error })
        }
    }

    async assignStaffToBranch(branchId: string, staffId: string): Promise<Staff> {
        try {
            const staff = await this.staff.update({
                where: { id: staffId },
                data: {
                    branch: { connect: { id: branchId } }
                }
            });
            return new Staff({ ...staff });
        } catch (error) {
            throw new PrismaException({ source: 'assign Staff To Branch', message: error.message, statusCode: 500, exception: error })
        }
    }

    async assignStaffToBusiness(businessId: string, staffId: string): Promise<Staff> {
        try {
            const staff = await this.staff.update({
                where: { id: staffId },
                data: {
                    business: { connect: { id: businessId } }
                }
            });
            return new Staff({ ...staff });
        } catch (error) {
            throw new PrismaException({ source: 'assign Staff To Business', message: error.message, statusCode: 500, exception: error })
        }
    }

    async unAssignStaffFromBranch(branchId: string, staffId: string): Promise<Staff> {
        try {
            const staff = await this.staff.update({
                where: { id: staffId },
                data: {
                    branch: { disconnect: true }
                }
            });
            return new Staff({ ...staff });
        } catch (error) {
            throw new PrismaException({ source: 'unAssign Staff From Branch', message: error.message, statusCode: 500, exception: error })
        }
    }

    async unAssignStaffFromBusiness(businessId: string, staffId: string): Promise<Staff> {
        try {
            const staff = await this.staff.update({
                where: { id: staffId },
                data: {
                    business: { disconnect: true }
                }
            });
            return new Staff({ ...staff });
        } catch (error) {
            throw new PrismaException({ source: 'unAssign Staff From Business', message: error.message, statusCode: 500, exception: error })
        }
    }

    async updateStaffInfo(staffId: string, staffInfo: Partial<Staff>): Promise<Staff> {
        try {
            const { business, branch, branchId, businessId, ...basicStaffInfo } = staffInfo;
            const updatedStaff = await this.staff.update({
                where: { id: staffId },
                data: basicStaffInfo
            });
            return new Staff({ ...updatedStaff });
        } catch (error) {
            throw new PrismaException({ source: 'update Staff Info', message: error.message, statusCode: 500, exception: error })
        }
    }

    async getBusinessStaffs(businessId: string): Promise<Staff[]> {
        try {
            let staffs = await this.staff.findMany({
                where: {
                    businessId: businessId
                }
            });
            return staffs.map(staff => new Staff({ ...staff }));
        } catch (error) {
            throw new PrismaException({ source: 'get Business Staffs', message: error.message, statusCode: 500, exception: error })
        }
    }

    async getBranchStaffs(branchId: string): Promise<Staff[]> {
        try {
            let staffs = await this.staff.findMany({
                where: {
                    branchId: branchId
                }
            });
            return staffs.map(staff => new Staff({ ...staff }));
        } catch (error) {
            throw new PrismaException({ source: 'get Branch Staffs', message: error.message, statusCode: 500, exception: error })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}