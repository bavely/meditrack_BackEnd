import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/register-user.input';
import { User  } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserInput): Promise<User> {
    console.log('Creating user with data:', data);
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

async getRefreshToken(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { refreshTokens: true },
    });
    return user?.refreshTokens?.[0]?.token || null;
  }

  async setRefreshToken(userId: string, token: string): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { id: userId }, // Use the correct unique field(s) as per your Prisma schema
      update: { token },
      create: { 
        id: userId, 
        token, 
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // example: 7 days from now
        user: { connect: { id: userId } }
      },
    });
  }

}
