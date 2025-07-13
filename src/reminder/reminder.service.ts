import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicationService } from 'src/medication/medication.service';
import { UserService } from 'src/user/user.service';
import { NotificationsService } from 'src/notification/notifications.service';
@Injectable()
export class ReminderService {
constructor(private readonly medicationService: MedicationService, private readonly userService: UserService, private readonly notificationsService: NotificationsService) {}



}
