import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/register-user.input';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserInput): Promise<User> {
    this.logger.debug(`Creating user with email: ${data.email}`);
    let userExists = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (userExists) {
      throw new Error('User already exists');
    }
    return this.prisma.user.create({ data: { ...data } as any });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshTokens: true },
    });
    const stored = user?.refreshTokens?.[0]?.token;
    if (!stored) return false;
    return bcrypt.compare(token, stored);
  }

  async setRefreshToken(userId: string, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    await this.prisma.refreshToken.upsert({
      where: { id: userId },
      update: { token: hashed, expiresAt, revoked: false },
      create: {
        userId,
        token: hashed,
        expiresAt,
      },
    });
  }

}

