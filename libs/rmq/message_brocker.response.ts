export interface IMessageBrockerResponse<T> {
    success: boolean
    message?: string
    data?: T
}