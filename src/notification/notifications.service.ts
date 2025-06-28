import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendPushNotification(user: any, message: string, medicationId: string) {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: user.pushToken,
      title: 'MediTrack Reminder',
      body: message,
    });

    await this.logNotification(user.id, medicationId, message, 'push');
  }

  async sendSmsReminder(user: any, message: string, medicationId: string) {
    await axios.post('https://api.twilio.com/your-endpoint', {
      to: user.phoneNumber,
      body: message,
    });

    await this.logNotification(user.id, medicationId, message, 'sms');
  }

  async logNotification(userId: string, medicationId: string, message: string, channel: string = 'unknown') {
    await this.prisma.notificationLog.create({
      data: {
        userId,
        medicationId,
        message,
        channel,
      },
    });
  }

  async markAsOpened(logId: string) {
    await this.prisma.notificationLog.update({
      where: { id: logId },
      data: { openedAt: new Date() },
    });
  }
}
