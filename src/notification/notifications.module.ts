import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ import

@Module({
  imports: [PrismaModule], // ✅ required for PrismaService injection
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
