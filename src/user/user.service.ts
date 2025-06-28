import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserInput } from './dto/register-user.input';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async registerIfNotExists(input: RegisterUserInput): Promise<User> {
    const existing = await this.findById(input.id);
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        id: input.id,
        email: input.email,
        name: input.name,
        pushToken: input.pushToken,
        prefersPush: true,
        prefersSms: false,
      },
    });
  }
}
