export interface IMessageBrockerResponse<T = void> {
    success: boolean
    message?: string
    data?: T | undefined
}