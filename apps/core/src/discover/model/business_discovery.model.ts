import { Field, ObjectType } from "@nestjs/graphql"
import { IDiscovery, DiscoverTypes } from "./discovery_interface.response"
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model"
import { Business } from "../../business/model/business.model"

@ObjectType()
export class BusinessDiscovery extends IDiscovery<Business> {

    @Field(type => [Business])
    items: Business[]
    constructor(partial?: Partial<BusinessDiscovery>) {
        super(partial)

    }

    static getLocalizedTitle(selectedFiledValue: LocalizedField[], discoverTypes: DiscoverTypes, selectedLanguage: LanguageKey) {
        switch (discoverTypes) {
            case DiscoverTypes.TOP_BUSINESS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)} የተወደዱ ቢዝነሶች`
                }
            default:
                return `${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
        }
    }

    static getSubtitleBasedOnDiscoverType(discoverType: DiscoverTypes, selectedLanguage: LanguageKey): string | null {
        switch (discoverType) {
            case DiscoverTypes.TOP_BUSINESS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `Top products from your favorite businesses`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከየታየቱ በላይ አይነት`
                }
            default: null;

        }
    }

    static toDiscoverResponse({ lcoalizedField, items, sequence, discoverType, selectedLanguage, addSubtitle }: { lcoalizedField: LocalizedField[]; items: Business[]; selectedLanguage: LanguageKey; sequence: number; discoverType: DiscoverTypes; addSubtitle?: boolean; }): BusinessDiscovery {
        return new BusinessDiscovery({
            title: this.getLocalizedTitle(lcoalizedField, discoverType, selectedLanguage),
            subtitle: addSubtitle ? this.getSubtitleBasedOnDiscoverType(discoverType, selectedLanguage) : undefined,
            items: items,
            sequence: sequence
        })
    }

    static getTopBusinessTitle(): LocalizedField[] {
        return [
            new LocalizedField({ key: LanguageKey.ENGLISH, value: "Top Businesses" }),
            new LocalizedField({ key: LanguageKey.AMHARIC, value: "የቅርብ ቢዝነሶች" })
        ]
    }

    static getNewBusinessTitle(): LocalizedField[] {
        return [
            new LocalizedField({ key: LanguageKey.ENGLISH, value: "New Businesses" }),
            new LocalizedField({ key: LanguageKey.AMHARIC, value: "አዲስ ቢዝነሶች" })
        ]
    }
}