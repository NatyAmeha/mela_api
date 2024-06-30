export interface QueryHelper<T> {
    query?: T
    orderBy?: Map<string, string>
    limit?: number
    page?: number
}