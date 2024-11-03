import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Cart } from "../model/cart.model";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { includes, remove, uniqBy, uniqWith } from "lodash";

export interface ICartRepository {
    addTransactionClient: (client: PrismaClient) => void
    addOrUpdateProductToCart(cartInfo: Cart): Promise<Cart>
    removeItemsFromCart(cartId: string, userId: string, productIds: string[]): Promise<Cart>
    getUserCarts(userId: string): Promise<Cart[]>

}

@Injectable()
export class CartRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ICartRepository {
    static injectName = 'CART_REPOSITORY'

    transactionClient: PrismaClient | null

    addTransactionClient(client: PrismaClient): void {
        this.transactionClient = client;
    }

    async onModuleInit() {
        await this.$connect()
    }

    async addOrUpdateProductToCart(cartInfo: Cart): Promise<Cart> {
        try {
            const existingCart = await (this.transactionClient || this).cart.findFirst({ where: { businessId: cartInfo.businessId, userId: cartInfo.userId } })

            if (existingCart?.id) {
                const newItemsProductId = cartInfo.items.map((item) => item.productId)
                const existingItemsbyProductId = remove(existingCart.items, (item) => !includes(newItemsProductId, item.productId))

                const updateResult = await (this.transactionClient || this).cart.update({ where: { id: existingCart.id }, data: { items: { set: [...existingItemsbyProductId, ...cartInfo.items] } } })
                return new Cart({ ...updateResult })
            }
            const cartCreateResult = await (this.transactionClient || this).cart.create({ data: { ...cartInfo } })
            return new Cart({ ...cartCreateResult })
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
        return new Cart()
    }

    async removeItemsFromCart(cartId: string, userId: string, productIds: string[]): Promise<Cart> {
        try {
            const existingCart = await (this.transactionClient || this).cart.findFirst({ where: { id: cartId } })
            if (!existingCart || existingCart.userId !== userId) {
                throw new RequestValidationException({ message: "Cart not found" })
            }
            const newItems = remove(existingCart.items, (item) => !includes(productIds, item.productId))
            const updateResult = await (this.transactionClient || this).cart.update({ where: { id: cartId }, data: { items: { set: newItems } } })
            return new Cart({ ...updateResult })
        } catch (ex) {
            console.log(ex)
            if (ex instanceof RequestValidationException) {
                throw ex;
            }
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async getUserCarts(userId: string): Promise<Cart[]> {
        try {
            const carts = await (this.transactionClient || this).cart.findMany({ where: { userId: userId, items: { isEmpty: false } } })
            return carts.map(cart => new Cart({ ...cart }))
        } catch (ex) {
            console.log(ex)
            throw new PrismaException({ message: ex.message, code: ex.code, meta: ex.meta })
        }
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

}