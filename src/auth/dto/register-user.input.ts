import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class RegisterUserInput {
email: string;
password: string;
}   