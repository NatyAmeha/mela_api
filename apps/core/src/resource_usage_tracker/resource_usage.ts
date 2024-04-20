import { AppResources } from "apps/auth/src/authorization/model/access.model"

export class ResourceUsage {
    success: boolean
    message?: string
    resourceId: string
    resourceType: AppResources
    usage: number | string
    maxUsage: number | string

    construct(data: Partial<ResourceUsage>) {
        Object.assign(this, data)
    }

    isAtMaxUsage() {
        return this.usage >= this.maxUsage
    }


}