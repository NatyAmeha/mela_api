import { SearchContext } from "../model/search_context";


export abstract class SearchHandler {
    protected nextHandler: SearchHandler | null = null;

    setNext(handler: SearchHandler): SearchHandler {
        this.nextHandler = handler;
        return handler;
    }

    async handle(context: SearchContext): Promise<void> {
        await this.process(context);
        if (this.nextHandler) {
            await this.nextHandler.handle(context);
        }
    }

    protected abstract process(context: SearchContext): Promise<void>;
}
