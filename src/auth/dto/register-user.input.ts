import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ResponseType } from '../../common/dto/response.dto';
import { LoginResponse } from '../models/login-response.model';
@ObjectType()
export class RegisterUserInput {
email: string;
password: string;
} 


@ObjectType()
export class AuthResponse extends ResponseType<LoginResponse>(LoginResponse) {
    
}


