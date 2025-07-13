import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

 
}
