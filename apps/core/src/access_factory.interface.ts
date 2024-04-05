import { Access } from "apps/auth/src/authorization/model/access.model";
import { Business } from "./business/model/business.model";
import { BusinessAccessGenerator } from "./business/business_access_factory";
import { BaseModel } from "@app/common/model/base.model";

export interface IAccessFactory {
    getBusinessAccessGenerator(): IAccessGenerator<Business>

}

export interface IAccessGenerator<T extends BaseModel> {
    createDefaultAccess(data: T, role?: string): Promise<Access[]>
}


export class AccessFactory implements IAccessFactory {
    static injectName = "DefaultAccessFactory";
    getBusinessAccessGenerator(): IAccessGenerator<Business> {
        return new BusinessAccessGenerator()
    }
}