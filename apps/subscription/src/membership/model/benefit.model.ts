import { LocalizedField } from "@app/common/model/localized_model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { MembershipPerkType } from "./memberhip.model";

@ObjectType()
export class Benefit {
    @Field(type => ID)
    id: string;
    @Field(type => [LocalizedField])
    name: LocalizedField[];
    @Field(type => MembershipPerkType)
    perkType?: string;
    constructor(data: Partial<Benefit>) {
        Object.assign(this, data)
    }
}

