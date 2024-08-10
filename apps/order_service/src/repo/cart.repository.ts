import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Cart } from "../model/cart.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";

export interface ICartRepository {
    addToCart(cartInfo: Cart): Promise<Cart>

}

@Injectable()
export class CartRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ICartRepository {
    static injectName = 'CART_REPOSITORY'

    async onModuleInit() {
        await this.$connect()
    }

    async addToCart(cartInfo: Cart): Promise<Cart> {
        try {
            const existingCart = await this.cart.findFirst({ where: { businessId: cartInfo.businessId, userId: cartInfo.userId } })
            const { items, ...restCartInfo } = cartInfo
            if (existingCart?.id) {
                const updateResult = await this.cart.update({ where: { id: existingCart.id }, data: { items: { push: items } } })
                return new Cart({ ...existingCart })
            }
            const cartCreateResult = await this.cart.create({ data: { ...cartInfo } })
            return new Cart({ ...cartCreateResult })
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
        return new Cart()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}