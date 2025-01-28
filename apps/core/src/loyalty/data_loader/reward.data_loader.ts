import { Injectable } from "@nestjs/common";
import * as DataLoader from "dataloader";
import { Business } from "../../business/model/business.model";
import { Product } from "../../product/model/product.model";
import { BusinessService } from "../../business/usecase/business.service";
import { ProductService } from "../../product/usecase/product.service";

@Injectable()
export class RewardBusinessLoader {
    private readonly dataLoader: DataLoader<string, Business>;

    constructor(private readonly businessService: BusinessService) {
        this.dataLoader = new DataLoader<string, Business>(async (businessIds) => {
            const businesses = await Promise.all(
                businessIds.map(id => this.businessService.getMinimalBusinessInfo(id))
            );
            return businessIds.map(id => businesses.find(b => b.id === id));
        });
    }

    public async load(id: string): Promise<Business> {
        return this.dataLoader.load(id);
    }
}

@Injectable()
export class RewardProductLoader {
    private readonly dataLoader: DataLoader<string, Product>;

    constructor(private readonly productService: ProductService) {
        this.dataLoader = new DataLoader<string, Product>(async (productIds) => {
            const products = await Promise.all(
                productIds.map(id => this.productService.getProductDetailsWithInventory(id))
                    .map(async (promise) => (await promise).product)
            );
            return productIds.map(id => products.find(p => p.id === id));
        });
    }

    public async load(id: string): Promise<Product> {
        return this.dataLoader.load(id);
    }
}

export const RewardDataLoaders = [
    RewardBusinessLoader,
    RewardProductLoader,
]; 