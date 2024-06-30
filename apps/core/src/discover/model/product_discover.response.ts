import { Field, ObjectType } from "@nestjs/graphql"
import { DiscoverResponse, DiscoverTypes } from "./discover_response.model"
import { Product } from "../../product/model/product.model"
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model"

@ObjectType()
export class ProductDiscoverResponse extends DiscoverResponse<Product> {

    @Field(type => [Product])
    items: Product[]
    constructor(partial?: Partial<ProductDiscoverResponse>) {
        super(partial)

    }

    static getLocalizedTitle(selectedFiledValue: LocalizedField[], discoverTypes: DiscoverTypes, selectedLanguage: LanguageKey) {
        switch (discoverTypes) {
            case DiscoverTypes.TOP_BUSINESS_PRODUCTS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `top products from ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)} የተወደዱ አገልግሎቶች`
                }
            default:
                return `Products from ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
        }
    }

    static getSubtitleBasedOnDiscoverType(discoverType: DiscoverTypes, selectedLanguage: LanguageKey): string | null {
        switch (discoverType) {
            case DiscoverTypes.TOP_BUSINESS_PRODUCTS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `Top products from your favorite businesses`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከየታየቱ በላይ አይነት አገልግሎች`
                }
            default: null;

        }
    }

    static toDiscoverResponse({ lcoalizedField, items, sequence, discoverType, selectedLanguage, addSubtitle }: { lcoalizedField: LocalizedField[]; items: Product[]; selectedLanguage: LanguageKey; sequence: number; discoverType: DiscoverTypes; addSubtitle?: boolean; }): ProductDiscoverResponse {
        return new ProductDiscoverResponse({
            title: this.getLocalizedTitle(lcoalizedField, discoverType, selectedLanguage),
            subtitle: addSubtitle ? this.getSubtitleBasedOnDiscoverType(discoverType, selectedLanguage) : undefined,
            items: items,
            sequence: sequence
        })
    }
}