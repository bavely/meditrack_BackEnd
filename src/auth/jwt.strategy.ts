import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
  
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
    this.logger.debug('JWT strategy initialized');
  }

  async validate(payload: any) {
    this.logger.debug(`JWT payload validated for user ${payload?.sub}`);
    return payload;
  }
}
