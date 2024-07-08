import { LanguageKey, LocalizedField } from "@app/common/model/localized_model";
import { Field, ObjectType } from "@nestjs/graphql";
import { Product } from "../../product/model/product.model";



@ObjectType()
export abstract class IDiscovery<T> {
    @Field()
    title: string
    @Field({ nullable: true })
    subtitle?: string
    @Field()
    sequence: number

    constructor(partial?: Partial<IDiscovery<T>>) {
        Object.assign(this, partial);
    }

}

export enum DiscoverTypes {
    TOP_BUSINESS_PRODUCTS = "TOP_PRODUCTS",
    TOP_BUSINESS_BUNDLES = "TOP_BUNDLES",
    TOP_BUSINESS = "TOP_BUSINESS",
    TOP_PRODUCTS = "TOP_PRODUCTS",
    NEW_PRODUCTS = "NEW_PRODUCTS",
    TOP_BUNDLES = "TOP_BUNDLES",

    TOP_MEMBERSHIPS = "TOP_MEMBERSHIPS",
    TOP_BUSINESS_MEMBERSHIPS = "TOP_BUSINESS_MEMBERSHIPS",
}




