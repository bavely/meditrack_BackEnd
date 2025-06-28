import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field({ nullable: true })
  pushToken?: string;

  @Field()
  prefersPush: boolean;

  @Field()
  prefersSms: boolean;

  @Field()
  timezone: string;

  @Field()
  createdAt: Date;
}
