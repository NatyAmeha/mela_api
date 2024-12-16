import { Injectable, Scope } from "@nestjs/common";



export interface ITransaction {
    execute<T>(prisma: any, action: (transactionContext: any) => Promise<T>, { timeOut }: { timeOut: number }): Promise<T>;
}

@Injectable({ scope: Scope.REQUEST })
export class PrismaTransaction implements ITransaction {

    async execute<T>(prisma: any, action: (transactionContext: any) => Promise<T>, { timeOut }: { timeOut: number } = { timeOut: 10000 }): Promise<T> {
        try {
            return await prisma.$transaction(async (context) => {
                return await action(context);
            }, { maxWait: timeOut * 3, timeout: timeOut });
        } catch (error) {
            // Handle transaction errors here
            console.error("Transaction failed:", error);
            throw error; // Re-throw the error after logging or handling
        }
    }
}