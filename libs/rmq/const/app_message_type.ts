export enum AuthServiceMessageType {
    REQUEST_AUTH_USER = "REQUEST_AUTH_USER",
    CREATE_ACCESS_PERMISSION = "CREATE_ACCESS_PERMISSION",
    PLATFORM_ACCESS_PERMISSION_CREATED = "PLATFORM_ACCESS_PERMISSION_CREATED",
    REVOKE_PREVIOUS_PLATFORM_ACCESS_PERMISSION_AND_CREATE_NEW_ACCESS = "REVOKE_PREVIOUS_PLATFORM_ACCESS_PERMISSION_AND_CREATE_NEW_ACCESS",
    REVOKE_PLATFORM_ACCESS_PERMISSION_FROM_BUSINESS = "REVOKE_PLATFORM_ACCESS_PERMISSION_FROM_BUSINESS"
}

export enum CoreServiceMessageType {
    UPDATE_BUSINESS_REGISTRATION_STAGE = "UPDATE_BUSINESS_REGISTRATION_STAGE",
    GET_BUSINESS_INFO = "GET_BUSINESS_INFO",

}

export enum SubscriptionServiceMessageType {
    CREATE_SUBSCRIPTION_PLAN = "CREATE_SUBSCRIPTION_PLAN",
    SUBSCRIPTION_PLAN_CREATED = "SUBSCRIPTION_PLAN_CREATED",
    PLATFORM_SUBSCRIPTION_CREATED_EVENT = "PLATFORM_SUBSCRIPTION_CREATED",
    GET_BUSINESS_SUBSCRIPTION_WITH_ALL_PLATFORM_SERVICES = "GET_BUSINESS_SUBSCRIPTION_WITH_ALL_PLATFORM_SERVICES",

    PRODUCT_ASSIGNMENT_TO_MEMBERSHIP = "PRODUCT_ASSIGNMENT_TO_MEMBERSHIP",
    PRODUCT_UNASSIGNMENT_FROM_MEMBERSHIP = "PRODUCT_UNASSIGNMENT_FROM_MEMBERSHIP",
    GET_MEMBERSHIP_PRODUCTS = "GET_MEMBERSHIP_PRODUCTS",
}

export enum MembershipMessageType {
    PRODUCT_ASSIGNMENT_TO_MEMBERSHIP = "PRODUCT_ASSIGNMENT_TO_MEMBERSHIP",
    PRODUCT_UNASSIGNMENT_FROM_MEMBERSHIP = "PRODUCT_UNASSIGNMENT_FROM_MEMBERSHIP",
    GET_MEMBERSHIP_PRODUCTS = "GET_MEMBERSHIP_PRODUCTS",
    GET_BUSINESS_MEMBERSHIPS = "GET_BUSINESS_MEMBERSHIPS",
}

export const DEFAULT_REPLY_RESPONSE_TIMEOUT = "30000"; // 30 seconds


