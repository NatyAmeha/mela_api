import { ArgsType, Field } from "@nestjs/graphql"
import { isEmail, isString } from "class-validator"

export class AuthInfo {
    email?: string
    password?: string
    phoneNumber?: string
}