import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterUserInput {
  @Field()
  id: string; // Auth0 `sub`

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  pushToken?: string;
}
