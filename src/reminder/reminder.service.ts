import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicationService } from 'src/medication/medication.service';
import { UserService } from 'src/user/user.service';
import { NotificationsService } from 'src/notification/notifications.service';
@Injectable()
export class ReminderService {
constructor(private readonly medicationService: MedicationService, private readonly userService: UserService, private readonly notificationsService: NotificationsService) {}


@Cron(CronExpression.EVERY_HOUR)
async handleHourlyReminders() {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  const meds = await this.medicationService.getScheduledWithin(now, nextHour);

  for (const med of meds) {
    const user = await this.userService.findById(med.userId);

    if (!user) continue;
    const message = `💊 Time to take ${med.name} (${med.dosage})`;

    // 👤 Respect notification preference
    if (user.prefersPush && user.pushToken) {
      await this.notificationsService.sendPushNotification(user, message, med.id);
    }
    if (user.prefersSms && user.phoneNumber) {
      await this.notificationsService.sendSmsReminder(user, message, med.id);
    }

    // 📈 Log notification
    await this.notificationsService.logNotification(user.id, med.id, message);
  }
}


}
