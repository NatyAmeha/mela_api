import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { SignupInput } from "./signup.input";
import { User } from "../model/user.model";
import { isNil, omitBy } from "lodash";

@InputType()
export class UpdateUserInput extends PartialType(SignupInput) {
    @Field()
    accountStatus?: string

    getUserInfo() {
        var user = new User({
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
            phoneNumber: this.phoneNumber,
            profileImageUrl: this.profileImageUrl,
            accountStatus: this.accountStatus
        });
        var sanitizedObject = omitBy(user, u => isNil(u))
        return new User(sanitizedObject);
    }
}