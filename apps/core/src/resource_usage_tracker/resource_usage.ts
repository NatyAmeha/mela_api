import { AppResources } from "apps/mela_api/src/const/app_resource.constant"

export class ResourceUsage {
    success: boolean
    message?: string
    resourceId: string
    resourceType: AppResources
    usage: number | string
    maxUsage: number | string

    constructor(data: Partial<ResourceUsage>) {
        Object.assign(this, data)
    }

    isAtMaxUsage() {
        return this.usage >= this.maxUsage
    }


}