import { Field, ObjectType } from "@nestjs/graphql"
import { IDiscovery, DiscoverTypes } from "./discovery_interface.response"
import { ProductBundle } from "../../product/model/product_bundle.model"
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model"

@ObjectType()
export class BundleDiscovery extends IDiscovery<ProductBundle> {

    @Field(type => [ProductBundle])
    items: ProductBundle[]
    constructor(partial?: Partial<BundleDiscovery>) {
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

    static toDiscoverResponse({ lcoalizedField, items, sequence, discoverType, selectedLanguage, addSubtitle }: { lcoalizedField: LocalizedField[]; items: ProductBundle[]; selectedLanguage: LanguageKey; sequence: number; discoverType: DiscoverTypes; addSubtitle?: boolean; }): BundleDiscovery {
        return new BundleDiscovery({
            title: this.getLocalizedTitle(lcoalizedField, discoverType, selectedLanguage),
            subtitle: addSubtitle ? this.getSubtitleBasedOnDiscoverType(discoverType, selectedLanguage) : undefined,
            items: items,
            sequence: sequence
        })
    }

    static getTopBundlesTitle(): LocalizedField[] {
        return [
            new LocalizedField({ key: LanguageKey.ENGLISH, value: "Top Bundles" }),
            new LocalizedField({ key: LanguageKey.AMHARIC, value: "የቅርብ ጥቅሎች" })
        ]
    }

    static getNewBundlesTitle(): LocalizedField[] {
        return [
            new LocalizedField({ key: LanguageKey.ENGLISH, value: "New Bundles" }),
            new LocalizedField({ key: LanguageKey.AMHARIC, value: "አዲስ ጥቅሎች" })
        ]
    }
}