import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
  
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }

    console.log('token:', ExtractJwt.fromAuthHeaderAsBearerToken());
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate( payload: any) {
    console.log('JWT payload:', payload);
    return payload;
  }
}