import { LocalizedField } from "@app/common/model/localized_model";
import { Directive, Field, ID, ObjectType } from "@nestjs/graphql";
import { types } from "joi";
import { CreatePriceListInput, UpdatePriceListInput } from "../dto/price_list.input";
import { removeNull } from "@app/common/utils/helper";

@ObjectType()
@Directive('@shareable')
export class PriceList {
    @Field(types => ID)
    id: string
    @Field(types => [LocalizedField])
    name: LocalizedField[]
    @Field(types => [LocalizedField], { defaultValue: [] })
    description: LocalizedField[]


    @Field(types => [String], { defaultValue: [] })
    branchIds?: string[]
    @Field({ defaultValue: true })
    isActive: boolean
    @Field()
    createdAt?: Date
    @Field()
    updatedAt?: Date
    constructor(partial: Partial<PriceList>) {
        Object.assign(this, partial)
    }

    static fromCreatePriceListInput(createPriceListInput: CreatePriceListInput | UpdatePriceListInput) {
        const priceListIInfo = new PriceList({
            ...createPriceListInput,
            name: createPriceListInput.name?.map(name => new LocalizedField(name)),
            description: createPriceListInput.description?.map(description => new LocalizedField(description)),
        })
        // remove null from pricelistinfo
        removeNull(priceListIInfo)
        return priceListIInfo
    }

}