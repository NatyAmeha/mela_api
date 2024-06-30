import { BaseModel } from "@app/common/model/base.model"


export interface IMessageBrockerResponse<T = void> {
    success: boolean
    message?: string
    data?: T | undefined
}

export class MessageBrockerResponseBuilder {
    private response: IMessageBrockerResponse<any> = { success: false }
    private constructor() { }
    static create<T>(success: boolean, msg?: string): MessageBrockerResponseBuilder {
        const builder = new MessageBrockerResponseBuilder()
        builder.response = { success: success, message: msg } as IMessageBrockerResponse<T>

        return builder
    }


    withData<T>(data: T) {
        this.response.data = data
        return this
    }
    build() {
        return this.response
    }
}