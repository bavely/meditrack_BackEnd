import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {


  @Field()
  aud: string

  @Field()
  role: string

  @Field()
  email: string

  @Field({ nullable: true })
  name?: string 

  @Field({ nullable: true })
  phoneNumber?: string

  @Field()
  password: string
}