import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql"
import { ArrayNotEmpty, IsNotEmpty } from "class-validator"

@ObjectType()
export class Productoption {
    @Field()
    key: string
    @Field(types => [String])
    value: string[]
}

@InputType()
export class ProductOptionInput extends PickType(Productoption, ['key', 'value'] as const) {
    @IsNotEmpty()
    key: string
    @ArrayNotEmpty()
    value: string[]
}