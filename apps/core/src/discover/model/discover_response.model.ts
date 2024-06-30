import { LanguageKey, LocalizedField } from "@app/common/model/localized_model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";



@ObjectType({ isAbstract: true })
export abstract class DiscoverResponse<T> {
    title: string
    subtitle?: string
    sequence: number

    constructor(partial?: Partial<DiscoverResponse<T>>) {
        Object.assign(this, partial);
    }

}

export enum DiscoverTypes {
    TOP_BUSINESS_PRODUCTS = "TOP_PRODUCTS",
    TOP_BUSINESS_BUNDLES = "TOP_BUNDLES",
    TOP_BUSINESS = "TOP_BUSINESS",
}




