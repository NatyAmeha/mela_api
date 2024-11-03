import { Access } from "../../authorization/model/access.model"
import { User } from "./user.model"

export interface JwtPayload {
    sub: string // id of the user
    username: string
    email: string
    phoneNumber: string
    accesses: Access[]
    refreshToken?: string
}