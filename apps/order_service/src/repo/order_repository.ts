import { Injectable } from "@nestjs/common";

export interface IOrderRepository {

}

@Injectable()
export class OrderRepository implements IOrderRepository {
    static injectName = 'ORDER_REPOSITORY'

}