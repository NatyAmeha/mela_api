import { Field, ObjectType } from "@nestjs/graphql"
import { IDiscovery, DiscoverTypes } from "./discovery_interface.response"
import { LanguageKey, LocalizedField } from "@app/common/model/localized_model"
import { Membership } from "apps/subscription/src/membership/model/memberhip.model"

@ObjectType()
export class MembershipDiscovery extends IDiscovery<Membership> {

    @Field(type => [Membership])
    items: Membership[]
    constructor(partial?: Partial<MembershipDiscovery>) {
        super(partial)

    }

    static getLocalizedTitle(selectedFiledValue: LocalizedField[], discoverTypes: DiscoverTypes, selectedLanguage: LanguageKey) {
        switch (discoverTypes) {
            case DiscoverTypes.TOP_BUSINESS_MEMBERSHIPS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)}`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከ${LocalizedField.selectValueByKey(selectedLanguage, selectedFiledValue)} የተወደዱ አባላት`
                }
            default:
                return `Top memberships`
        }
    }

    static getSubtitleBasedOnDiscoverType(discoverType: DiscoverTypes, selectedLanguage: LanguageKey): string | null {
        switch (discoverType) {
            case DiscoverTypes.TOP_BUSINESS_MEMBERSHIPS:
                if (selectedLanguage === LanguageKey.ENGLISH) {
                    return `Top Membership from your favorite businesses`
                }
                else if (selectedLanguage === LanguageKey.AMHARIC) {
                    return `ከየታየቱ በላይ አይነት`
                }
            default: null;

        }
    }

    static toDiscoverResponse({ lcoalizedField, items, sequence, discoverType, selectedLanguage, addSubtitle }: { lcoalizedField: LocalizedField[]; items: Membership[]; selectedLanguage: LanguageKey; sequence: number; discoverType: DiscoverTypes; addSubtitle?: boolean; }): MembershipDiscovery {
        return new MembershipDiscovery({
            title: this.getLocalizedTitle(lcoalizedField, discoverType, selectedLanguage),
            subtitle: addSubtitle ? this.getSubtitleBasedOnDiscoverType(discoverType, selectedLanguage) : undefined,
            items: items,
            sequence: sequence
        })
    }
}