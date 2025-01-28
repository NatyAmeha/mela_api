import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "apps/order_service/prisma/generated/prisma_order_client";
import { RequestValidationException } from "@app/common/errors/request_validation_exception";
import { PrismaException } from "@app/common/errors/prisma_exception";
import { Customer } from "../model/customer.model";
import { plainToClass } from "class-transformer";
import { QueryHelper } from "@app/common/datasource_helper/query_helper";
import { LocalizedField } from "@app/common/model/localized_model";

export interface ICustomerRepository {
    isCustomerAlreadyExist(userId: string, businessId: string): Promise<boolean>;
    addOrGetCustomer(customer: Customer, { businessName, transactionClient }?: { businessName?: LocalizedField[], transactionClient?: PrismaClient | undefined }): Promise<Customer>
    addCustomers(customers: Customer[], { transactionClient }?: { transactionClient?: PrismaClient | undefined }): Promise<Customer[]>
    getCustomer(customerId: string, { transactionClient }?: { transactionClient?: PrismaClient | undefined }): Promise<Customer | null>
    getCustomerByUserIdOrPhoneNumber({ userId, phoneNumber, transactionClient }?: { userId?: string, phoneNumber?: string, transactionClient?: PrismaClient | undefined }): Promise<Customer | null>
    getCustomersByUserId(userId: string, { transactionClient }?: { transactionClient?: PrismaClient | undefined }): Promise<Customer[] | undefined>
    getCustomerByPhoneNumber(phoneNumber: string, { businessId, transactionClient }?: { businessId: string, transactionClient?: PrismaClient | undefined }): Promise<Customer | null>
    getBusinessCustomer(userId: string, businessId: string, { transactionClient }?: { transactionClient?: PrismaClient | undefined }): Promise<Customer | null>
    getBusinessCustomers(businessId: string, queryHelper: QueryHelper<Customer>, { transactionClient }?: { transactionClient?: PrismaClient | undefined }): Promise<Customer[]>
}

@Injectable()
export class CustomerRepository extends PrismaClient implements OnModuleInit, OnModuleDestroy, ICustomerRepository {
    static injectName = 'CUSTOMER_REPOSITORY'

    async onModuleInit() {
        await this.$connect()
    }

    async isCustomerAlreadyExist(userId: string, businessId: string): Promise<boolean> {
        const existingCustomerByUserIdAndBusinessId = await this.customer.findFirst({ where: { userId, businessId } })
        return existingCustomerByUserIdAndBusinessId != null;
    }

    async getCustomerByUserIdOrPhoneNumber({ userId, phoneNumber, transactionClient }: { userId?: string, phoneNumber?: string, transactionClient?: PrismaClient | undefined } = {}): Promise<Customer | null> {
        try {
            const queryData = userId == null ? { phoneNumber } : { userId }
            const result = await (transactionClient || this).customer.findFirst({ where: queryData })
            return plainToClass(Customer, result)
        } catch (error) {
            console.log(error)
            throw new PrismaException({ source: "Get customer by user id or phone number", message: error })
        }
    }

    async addOrGetCustomer(customer: Customer, { businessName, transactionClient }: { businessName?: LocalizedField[], transactionClient?: PrismaClient | undefined } = {}): Promise<Customer> {
        try {
            const whereConditions = [];

            if (customer.userId) {
                whereConditions.push({ userId: customer.userId, businessId: customer.businessId });
            }

            if (customer.phoneNumber) {
                whereConditions.push({ phoneNumber: customer.phoneNumber, businessId: customer.businessId });
            }

            const existingCustomerByUserIdAndBusinessId = await (transactionClient || this).customer.findFirst({
                where: {
                    OR: whereConditions
                },
            })
            if (existingCustomerByUserIdAndBusinessId) {
                return existingCustomerByUserIdAndBusinessId;
            }
            const { customerLoyalties, redeemedRewards, ...customerData } = customer
            const result = await (transactionClient || this).customer.create({
                data: {
                    ...customerData, customerLoyalties: {
                        create: { businessId: customer.businessId, currentPoints: 0, pointsSource: [], name: businessName }
                    }
                }
            })
            return plainToClass(Customer, result)
        } catch (error) {
            console.log(error)
            if (error instanceof RequestValidationException) {
                throw error
            }
            throw new PrismaException(error)
        }
    }

    async addCustomers(customers: Customer[], { transactionClient }: { transactionClient?: PrismaClient | undefined } = {}): Promise<Customer[]> {
        try {
            const result = await (transactionClient || this).$transaction(async (tx) => {
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

    async getCustomer(customerId: string, { transactionClient }: { transactionClient?: PrismaClient | undefined } = {}): Promise<Customer | null> {
        try {
            const result = await (transactionClient || this).customer.findUnique({ where: { id: customerId } })
            if (!result) {
                return null
            }
            return plainToClass(Customer, result)
        } catch (error) {
            throw new PrismaException({ source: "Get customer", message: error })
        }
    }

    async getCustomersByUserId(userId: string): Promise<Customer[] | undefined> {
        try {
            const result = await this.customer.findMany({ where: { userId } })
            if (!result) {
                return null
            }
            return result.map(customer => plainToClass(Customer, customer))
        } catch (error) {
            throw new PrismaException({ source: "Get customer by user id", message: error })
        }
    }
    async getCustomerByPhoneNumber(phoneNumber: string, { businessId, transactionClient }: { businessId: string, transactionClient?: PrismaClient | undefined } = { businessId: "", transactionClient: undefined }): Promise<Customer | null> {
        try {
            const result = await (transactionClient || this).customer.findFirst({ where: { phoneNumber, businessId } })
            if (!result) {
                return null
            }
            return plainToClass(Customer, result)
        } catch (error) {
            throw new PrismaException({ source: "Get customer by phone number", message: error })
        }
    }

    async getBusinessCustomer(userId: string, businessId: string, { transactionClient }: { transactionClient?: PrismaClient | undefined } = {}): Promise<Customer> {
        try {
            const result = await (transactionClient || this).customer.findFirst({ where: { userId, businessId } })
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

    async getBusinessCustomers(businessId: string, queryHelper: QueryHelper<Customer>, { transactionClient }: { transactionClient?: PrismaClient | undefined } = {}): Promise<Customer[]> {
        try {
            const result = await (transactionClient || this).customer.findMany({
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