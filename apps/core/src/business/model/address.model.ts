import { ObjectType, Field, ID, InputType, Directive } from '@nestjs/graphql';


@ObjectType()
@Directive('@shareable')
export class Location {
    @Field(type => Number)
    latitude: number;

    @Field(type => Number)
    longitude: number;

    constructor(partial?: Partial<Location>) {
        Object.assign(this, partial);
    }

    // Method to calculate distance to another location in kilometers
    static calculateDistance(this: Location, other: Location): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = Location.toRad(other.latitude - this.latitude);
        const dLon = Location.toRad(other.longitude - this.longitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Location.toRad(this.latitude)) * Math.cos(Location.toRad(other.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    // Static helper method to create Location instance from raw data
    static fromRawData(data: { latitude: number; longitude: number }): Location {
        return new Location({
            latitude: data.latitude,
            longitude: data.longitude
        });
    }
}

@ObjectType()
@Directive('@shareable')
export class Address {
    @Field(types => ID)
    id?: string;

    @Field()
    address?: string;

    @Field()
    city?: string;

    @Field({ nullable: true })
    location?: string;

    @Field(type => Number, { nullable: true })
    latitude?: number;

    @Field(type => Number, { nullable: true })
    longitude?: number;


    constructor(partial?: Partial<Address>) {
        Object.assign(this, partial);
    }
}



@InputType()
export class AddressInput {
    @Field()
    address?: string;

    @Field()
    city: string;

    @Field({ nullable: true })
    location?: string;
}