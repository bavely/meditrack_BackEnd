import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ParsedLabel {
    @Field(() => String)
    name: string;

    @Field(() => String)
    dosage: string;

    @Field(() => String)
    quantity: string;

    @Field(() => String)
    instructions: string;

    @Field(() => String)
    therapy: string;

    
}
