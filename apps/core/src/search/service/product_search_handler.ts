// product-search.handler.ts
import { Inject, Injectable } from '@nestjs/common';
import { SearchHandler } from './search_handler.interface';
import { SearchContext, SearchFilterType } from '../model/search_context';
import { SearchResult } from '../model/search.model';
import { IProductRepository, ProductRepository } from '../../product/repo/product.repository';
import { Product } from '../../product/model/product.model';
import { QueryHelper } from '@app/common/datasource_helper/query_helper';


@Injectable()
export class ProductSearchHandler extends SearchHandler {
    constructor(
        @Inject(ProductRepository.injectName) private productRepo: IProductRepository,
    ) {
        super();
    }

    async process(context: SearchContext): Promise<void> {
        const { term, filters } = context;
        for (const key of Object.keys(filters)) {
            const filterType = key as SearchFilterType;
            const filterValue = filters[filterType];
            switch (filterType) {
                case SearchFilterType.BUSINESS:
                    const queryHelper: QueryHelper<Product> = {
                        query: {
                            businessId: filterValue
                        }
                    }
                    const products = await this.productRepo.searchProducts(term, queryHelper);
                    products.forEach(product => {
                        context.results.push({
                            id: product.id,
                            type: 'Product',
                            name: product.name,
                            metadata: JSON.stringify({ businessId: product.businessId, }),
                        } as SearchResult);
                    });
                    break;
            }
        }


    }
}
