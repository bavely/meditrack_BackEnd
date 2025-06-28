import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { MedicationModule } from '../medication/medication.module';
import { NotificationsModule } from '../notification/notifications.module';
import { UserModule } from '../user/user.module'; // ✅ Add this

@Module({
  imports: [
    MedicationModule,
    NotificationsModule,
    UserModule, // ✅ Required to inject UserService
  ],
  providers: [ReminderService],
})
export class ReminderModule {}
