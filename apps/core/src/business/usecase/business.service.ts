import { Inject, Injectable } from "@nestjs/common";
import { BusinessRepository, IBusinessRepository } from "../repo/business.repo";
import { Business } from "../model/business.model";

@Injectable()
export class BusinessService {

    constructor(@Inject(BusinessRepository.injectName) private businessRepo: IBusinessRepository) {

    }
    async createBusiness(data: Business) {
        return await this.businessRepo.createBusiness(data);
    }

    async getBusiness(id: string) {
        return await this.businessRepo.getBusiness(id);
    }

    async updateBusinessInfo(businessId: string, data: Partial<Business>) {
        return await this.businessRepo.updateBusiness(businessId, data);
    }

    async updateBusienssRegistrationStage(businessId: string, stage: string) {
        await this.businessRepo.updateBusiness(businessId, { stage: stage });
        return true;
    }

    async getProductBusiness(productId: string): Promise<Business> {
        return await this.businessRepo.getProductBusiness(productId);
    }
}