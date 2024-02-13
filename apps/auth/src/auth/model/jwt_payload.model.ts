export interface JwtPayload {
    sub: string
    username: string
    refreshToken?: string
}