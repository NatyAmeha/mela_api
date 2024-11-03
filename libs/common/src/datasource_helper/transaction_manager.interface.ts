


export interface ITransaction {
    execute<T>(prisma: any, action: (transactionContext: any) => Promise<T>, { timeOut }: { timeOut: number }): Promise<T>;
}

export class PrismaTransaction implements ITransaction {

    async execute<T>(prisma: any, action: (transactionContext: any) => Promise<T>, { timeOut }: { timeOut: number } = { timeOut: 10000 }): Promise<T> {
        return prisma.$transaction(async (context) => {
            return action(context);
        }, { maxWait: timeOut * 3, timeout: timeOut });
    }
}