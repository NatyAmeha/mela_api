import { Inject, Injectable } from "@nestjs/common";
import { UserRepository, IUserRepository } from "../data/repo/user.repository";
import { FavoriteBusienssInput, FavoriteBusinessInfo } from "../model/user.model";
import { ClassDecoratorValidator } from "@app/common/validation_utils/class_decorator.validator";
import { IValidator } from "@app/common/validation_utils/validator.interface";
import { UserResponse } from "../dto/user.response";


@Injectable()
export class UserService {
    constructor(
        @Inject(UserRepository.injectName) private userRepo: IUserRepository,
        @Inject(ClassDecoratorValidator.injectName) private validator: IValidator
    ) {

    }

    async addbusinesstoFavorite(userId: string, businessInfos: FavoriteBusienssInput[]): Promise<UserResponse> {
        await this.validator.validateArrayInput(businessInfos, FavoriteBusienssInput)
        const info = businessInfos.map((info) => FavoriteBusinessInfo.createFavoriteBusinessInfoFromInput(info));
        const result = await this.userRepo.addBusinessToFavorites(userId, info)
        return new UserResponse({ success: result })
    }

    async removeBusinessFromFavorites(userId: string, businessIds: string[]): Promise<UserResponse> {
        const result = await this.userRepo.removeBusinessFromFavorites(userId, businessIds)
        return new UserResponse({ success: result })
    }


}