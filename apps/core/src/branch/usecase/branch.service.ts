import { Inject, Injectable } from "@nestjs/common";
import { BranchRepository, IBranchRepository } from "../repo/branch.repository";
import { Branch } from "../model/branch.model";
import { CreateBranchInput } from "../dto/branch.input";

@Injectable()
export class BranchService {
    constructor(@Inject(BranchRepository.injectName) private branchRepo: IBranchRepository) {
    }

    async addBranchToBusiness(businessId: string, branchInfo: CreateBranchInput) {
        var fullBranchInfo = branchInfo.toBranch();
        return await this.branchRepo.addBranchToBusiness(businessId, fullBranchInfo);
    }

    updateBranchInfo(branchId: string, branchInfo: Partial<Branch>) {
        return this.branchRepo.updateBranch(branchId, branchInfo);
    }

    async getBranch(branchId: string): Promise<Branch> {
        return await this.branchRepo.getBranch(branchId);
    }

    async getBusinessBranches(businessId: string): Promise<Branch[]> {
        return await this.branchRepo.getBusinessBranches(businessId);
    }

}