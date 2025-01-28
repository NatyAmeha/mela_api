import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, ObjectType, Field, ID } from "@nestjs/graphql";
import { Gallery } from "./gallery.model";
import { CreateServiceOverviewInput, UpdateServiceOverviewInput } from "../dto/service_overview.input";

@ObjectType()
@Directive('@shareable')
export class ServiceOverview {
    @Field(type => ID)
    id: string
    @Field(type => [LocalizedField])
    title: LocalizedField[]
    @Field(type => [LocalizedField])
    description: LocalizedField[]
    @Field(type => [LocalizedField])
    callToAction?: LocalizedField[]
    @Field()
    callToActionUrl?: string
    @Field(type => Gallery)
    gallery?: Gallery
    @Field(type => Boolean, { defaultValue: true })
    isActive: boolean
    @Field(type => Boolean, { defaultValue: false })
    featured: boolean

    constructor(data: Partial<ServiceOverview>) {
        Object.assign(this, data)
    }

    static fromInput(input: CreateServiceOverviewInput | UpdateServiceOverviewInput) {
        return new ServiceOverview({
            title: input?.title?.map(t => new LocalizedField(t)),
            description: input?.description?.map(d => new LocalizedField(d)),
            callToAction: input?.callToAction?.map(c => new LocalizedField(c)),
            callToActionUrl: input?.callToActionUrl,
            gallery: input?.gallery,
            isActive: input?.isActive,
            featured: input?.featured
        })
    }
}