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
    isExceededMaxUsage(newResourceToBeAdded: number) {
        return ((this.usage as number) + newResourceToBeAdded) > (this.maxUsage as number)
    }

}

export class ResourceUsageBuilder {
    private resourceUsage: ResourceUsage
    constructor(resourceId: string, resourceType: AppResources) {
        this.resourceUsage = new ResourceUsage({
            resourceId: resourceId,
            resourceType: resourceType
        })
    }

    createInvalidResourceUsage(message: string) {
        this.resourceUsage.success = false
        this.resourceUsage.message = message
        this.resourceUsage.usage = 0
        this.resourceUsage.maxUsage = 0
        return this.resourceUsage
    }

    createSuccessResourceUsage(usage: number, maxUsage: number) {
        this.resourceUsage.success = usage < maxUsage,
            this.resourceUsage.usage = usage
        this.resourceUsage.maxUsage = maxUsage
        return this.resourceUsage
    }
}