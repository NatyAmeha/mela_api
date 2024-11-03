import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { includes, remove, result, uniqBy, uniqWith } from "lodash";
import { Customer } from "../model/customer.model";
import { plainToClass } from "class-transformer";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { CommonCustomerErrorMessages } from "apps/core/src/utils/const/error_constants";

export interface ICustomerRepository {
    addTransactionClient: (client: PrismaClient) => void
    isCustomerAlreadyExist(userId: string, businessId: string): Promise<boolean>;
    addOrGetCustomer(customer: Customer): Promise<Customer>
    addCustomers(customers: Customer[]): Promise<Customer[]>
    getCustomer(customerId: string): Promise<Customer | null>
    getCustomerByUserId(userId: string): Promise<Customer | undefined>
    getCustomerByPhoneNumber(phoneNumber: string, businessId: string): Promise<Customer | null>
    getBusinessCustomer(userId: string, businessId: string): Promise<Customer | null>
    getBusinessCustomers(businessId: string, queryHelper: QueryHelper<Customer>): Promise<Customer[]>
}

@Injectable()
export class CustomerRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ICustomerRepository {
    static injectName = 'CUSTOMER_REPOSITORY'

    transactionClient: PrismaClient | null

    async onModuleInit() {
        await this.$connect()
    }


    addTransactionClient(client: PrismaClient): void {
        this.transactionClient = client;
    }

    async isCustomerAlreadyExist(userId: string, businessId: string): Promise<boolean> {
        const existingCustomerByUserIdAndBusinessId = await this.customer.findFirst({ where: { userId, businessId } })
        return existingCustomerByUserIdAndBusinessId != null;
    }

    async addOrGetCustomer(customer: Customer): Promise<Customer> {
        try {
            const whereConditions = [];

            if (customer.userId) {
                whereConditions.push({ userId: customer.userId, businessId: customer.businessId });
            }

            if (customer.phoneNumber) {
                whereConditions.push({ phoneNumber: customer.phoneNumber, businessId: customer.businessId });
            }

            const existingCustomerByUserIdAndBusinessId = await (this.transactionClient || this).customer.findFirst({
                where: {
                    OR: whereConditions
                },
            })
            if (existingCustomerByUserIdAndBusinessId) {
                return existingCustomerByUserIdAndBusinessId;
            }
            const { customerLoyalties, redeemedRewards, ...customerData } = customer
            const result = await this.customer.create({ data: customerData })
            return plainToClass(Customer, result)
        } catch (error) {
            console.log(error)
            if (error instanceof RequestValidationException) {
                throw error
            }
            throw new PrismaException(error)
        }
    }

    async addCustomers(customers: Customer[]): Promise<Customer[]> {
        try {
            const result = await (this.transactionClient || this).$transaction(async (tx) => {
                const result = await Promise.all(customers.map(async (customer) => {
                    const { customerLoyalties, redeemedRewards, ...customerData } = customer
                    const createResult = await tx.customer.create({ data: customerData })
                    return plainToClass(Customer, createResult)
                }))
                return result
            });
            return result
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Add customers", message: error })
        }
    }

    async getCustomer(customerId: string): Promise<Customer | null> {
        try {
            const result = await (this.transactionClient || this).customer.findUnique({ where: { id: customerId } })
            if (!result) {
                return null
            }
            return plainToClass(Customer, result)
        } catch (error) {
            throw new PrismaException({ source: "Get customer", message: error })
        }
    }

    async getCustomerByUserId(userId: string): Promise<Customer | undefined> {
        try {
            const result = await (this.transactionClient || this).customer.findFirst({ where: { userId } })
            if (!result) {
                return null
            }
            return plainToClass(Customer, result)
        } catch (error) {
            throw new PrismaException({ source: "Get customer by user id", message: error })
        }
    }
    async getCustomerByPhoneNumber(phoneNumber: string, businessId: string): Promise<Customer | null> {
        try {
            const result = await (this.transactionClient || this).customer.findFirst({ where: { phoneNumber, businessId } })
            if (!result) {
                return null
            }
            return plainToClass(Customer, result)
        } catch (error) {
            throw new PrismaException({ source: "Get customer by phone number", message: error })
        }
    }

    async getBusinessCustomer(userId: string, businessId: string): Promise<Customer> {
        try {
            const result = await (this.transactionClient || this).customer.findFirst({ where: { userId, businessId } })
            if (result) {
                console.log('result', result)
                return plainToClass(Customer, result)
            }
            return null
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get customer by user id", message: error })
        }
    }

    async getBusinessCustomers(businessId: string, queryHelper: QueryHelper<Customer>): Promise<Customer[]> {
        try {
            const result = await (this.transactionClient || this).customer.findMany({
                where: { businessId },
                include: {
                    customerLoyalties: true,
                },
                orderBy: { ...queryHelper.orderBy as any },
                skip: queryHelper?.page ? ((queryHelper.page - 1) * queryHelper.limit) : 0,
                take: queryHelper?.limit
            })
            return result.map(customer => plainToClass(Customer, customer))
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get business customers", message: error })
        }
    }
    async onModuleDestroy() {
        await this.$disconnect()
    }

}