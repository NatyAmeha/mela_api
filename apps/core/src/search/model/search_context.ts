import { SearchResult } from "./search.model";

export enum SearchFilterType {
    BUSINESS = "businessId",
    BUSINESS_SECTION = "businessSectionId"
}

export class SearchContext {
    term: string;
    filters?: { [key: string]: any };
    results: SearchResult[] = [];
    page: number = 1;        // Default page
    pageLimit: number = 20;  // Default limit per page
    total: number = 0;       // Total matching items

}
