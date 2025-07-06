import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User as PrismaUser } from '@prisma/client';

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

  @Field()
  updatedAt: Date;

  @Field()
  aud: string;

  @Field()
  role: string;

@Field()
emailVerified: boolean;

  @Field()
phoneVerified: boolean;

  constructor(prismaUser: PrismaUser) {
    Object.assign(this, prismaUser);
  }
}