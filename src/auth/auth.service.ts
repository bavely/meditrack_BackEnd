import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { CreateUserInput } from '../user/dto/register-user.input';
import { LoginResponse } from './models/login-response.model';
import { Args } from '@nestjs/graphql';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: CreateUserInput) {
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({ 
        email: input.email,
        password: hash,
        role: 'USER',
        aud: 'mobile', // or 'web' based on your logic
        name: input.name, // Optional, can be empty
        phoneNumber: input.phoneNumber, // Optional, can be empty

    });
    return user;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    return user;
  }

async login(
  @Args('email') email: string,
  @Args('password') password: string,
): Promise<LoginResponse> {
  const user = await this.validateUser(email, password);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = this.jwt.sign(payload, { secret: process.env.JWT_ACCESS_SECRET , expiresIn: '15m' });
  const refreshToken = this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });

  // Optionally, save the refresh token for later validation
  await this.users.setRefreshToken(user.id, refreshToken);

  // map null → undefined so it fits your GraphQL model
  const mappedUser = user
    ? {
        ...user,
        name: user.name     ?? undefined,
        phoneNumber: user.phoneNumber ?? undefined,
        pushToken:   user.pushToken   ?? undefined,
      }
    : null;

  return { accessToken, refreshToken, user: mappedUser };
}


  async refresh(userId: string, token: string) {
    // verify stored token match
    const saved = await this.users.getRefreshToken(userId);
    if (saved !== token) throw new UnauthorizedException();

    const payload = { sub: userId };
    const accessToken = this.jwt.sign(payload);
    return { accessToken };
  }
}