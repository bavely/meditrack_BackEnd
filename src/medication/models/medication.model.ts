import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Medication {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  dosage: string;

  @Field()
  scheduleTime: Date;

  @Field()
  durationDays: number;

  @Field()
  quantity: number;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;
}
