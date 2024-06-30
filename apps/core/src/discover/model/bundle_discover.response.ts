import { Field, ObjectType } from "@nestjs/graphql"
import { DiscoverResponse, DiscoverTypes } from "./discover_response.model"
import { ProductBundle } from "../../product/model/product_bundle.model"
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model"

@ObjectType()
export class BundleDiscoverResponse extends DiscoverResponse<ProductBundle> {

    @Field(type => [ProductBundle])
    items: ProductBundle[]
    constructor(partial?: Partial<BundleDiscoverResponse>) {
        super(partial)

    }

    static getLocalizedTitle(selectedFiledValue: LocalizedField[], discoverTypes: DiscoverTypes, selectedLanguage: LanguageKey) {
        switch (discoverTypes) {
            case DiscoverTypes.TOP_BUSINESS_BUNDLES:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `top bundles from ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)} የተወደዱ ጥቅሎች`
                }
            default:
                return `Bundles from ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
        }
    }

    static getSubtitleBasedOnDiscoverType(discoverType: DiscoverTypes, selectedLanguage: LanguageKey): string | null {
        switch (discoverType) {
            case DiscoverTypes.TOP_BUSINESS_PRODUCTS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `Top bundles from your favorite businesses`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከየታየቱ በላይ አይነት ጥቅሎች`
                }
            default: null;

        }
    }

    static toDiscoverResponse({ lcoalizedField, items, sequence, discoverType, selectedLanguage, addSubtitle }: { lcoalizedField: LocalizedField[]; items: ProductBundle[]; selectedLanguage: LanguageKey; sequence: number; discoverType: DiscoverTypes; addSubtitle?: boolean; }): BundleDiscoverResponse {
        return new BundleDiscoverResponse({
            title: this.getLocalizedTitle(lcoalizedField, discoverType, selectedLanguage),
            subtitle: addSubtitle ? this.getSubtitleBasedOnDiscoverType(discoverType, selectedLanguage) : undefined,
            items: items,
            sequence: sequence
        })
    }
}