import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { ProductService } from './usecase/product.service';
import { InventoryService } from '../inventory/inventory.service';
import { MembershipService } from 'apps/subscription/src/membership/resolver/membership.service';


@Injectable({ scope: Scope.REQUEST })
export class ProductPriceLoader {
    constructor(private readonly productService: ProductService) { }

    // Create the DataLoader instance
    public readonly loader = new DataLoader(async (keys: Array<{ productId: string, branchId?: string, priceListId?: string }>) => {
        // Extract unique keys

        // Fetch product prices in a single query
        const prices = await this.productService.getBatchProductPrices(keys);

        // Map the fetched prices to the product IDs
        return keys.map(key => {
            return prices.filter(price =>
                price.productId === key.productId &&
                (!key.branchId || price.branchId === key.branchId) &&
                (!key.priceListId || price.priceListId === key.priceListId)
            );
        });
    });
}


@Injectable({ scope: Scope.REQUEST })
export class ProductInventoryLoader {
    constructor(private readonly inventoryService: InventoryService) { }

    public readonly loader = new DataLoader(async (keys: Array<{ productId: string, locationId?: string }>) => {
        const inventories = await this.inventoryService.getBatchProductInventories(keys);
        return keys.map(key => {
            return inventories?.filter(inventory => inventory.productId === key.productId && (!key.locationId || inventory.inventoryLocationId === key.locationId)) ?? [];
        });
    });
}


@Injectable()
export class ProductBundleLoader {
    constructor(private readonly productService: ProductService) { }

    public readonly loader = new DataLoader(async (keys: Array<{ productIds: string[] }>) => {
        const products = await this.productService.getBatchProducts(keys);
        return keys.map(key => {
            return products.filter(product => key.productIds.includes(product.id));
        });
    });
}

export const ProductDataLoaders = [ProductPriceLoader, ProductInventoryLoader, ProductBundleLoader]

