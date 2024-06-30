// user info used by microservices to get the user info fetched from auth service
// auth service has his own user class extending graphql fields

export interface GatewayApiFetchResponse {
    user?: UserInfo
    accesses?: GatewayUserAccess[],

}

export interface UserInfo {
    id?: string
    email?: string
    phoneNumber?: string
    username?: string
    isUsernamePlaceholder?: boolean
    password?: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string
    refreshToken?: string
    accountStatus?: string
    isEmailPlaceholder?: boolean
    emailVerified?: boolean
    phoneVerified?: boolean
    accesses?: GatewayUserAccess[]
    accessIds?: string[]
}

interface GatewayUserAccess {
    id?: string
    resourceId?: string
    role: string
    permissions?: Permission[]
    userId: string

    dateCreated?: Date
    dateUpdated?: Date
}

interface Permission {
    id?: string
    action: string
    resourceType: string
    resourceTarget: string
    effect: string
    groups?: PermissionGroup[]
    userGenerated?: boolean
}

interface PermissionGroup {
    id: String
}