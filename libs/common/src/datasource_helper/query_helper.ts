export interface QueryHelper<T> {
    query?: Partial<T>
    orderBy?: Object
    limit?: number
    page?: number
}