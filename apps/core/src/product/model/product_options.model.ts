import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql"

@ObjectType({ isAbstract: true })
export class Productoption {
    @Field()
    key: string
    @Field(types => [String])
    value: string[]
}

@InputType()
export class ProductOptionInput extends PickType(Productoption, ['key', 'value'] as const) {
    key: string
    value: string[]
}