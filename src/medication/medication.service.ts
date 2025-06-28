import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMedicationInput } from './dto/add-medication.input';
import { Medication } from '@prisma/client';

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  async create(input: AddMedicationInput, userId: string): Promise<Medication> {
    return this.prisma.medication.create({
      data: {
        ...input,
        scheduleTime: new Date(input.scheduleTime),
        userId,
      },
    });
  }

  async findByUser(userId: string): Promise<Medication[]> {
    return this.prisma.medication.findMany({
      where: { userId },
      orderBy: { scheduleTime: 'asc' },
    });
  }

  getRefillStatus(med: Medication): string {
    const pillsPerDay = 1; // Future: make dynamic
    const daysElapsed = Math.floor(
      (Date.now() - new Date(med.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const pillsTaken = daysElapsed * pillsPerDay;
    const daysLeft = Math.floor((med.quantity - pillsTaken) / pillsPerDay);

    if (daysLeft <= 0) return 'Out of medication!';
    if (daysLeft <= 5) return `Running low (${daysLeft} days left)`;
    return `OK (${daysLeft} days left)`;
  }

  async getDashboard(userId: string) {
    const meds = await this.findByUser(userId);
    const now = new Date();

    const upcomingDoses = meds.filter(
      (med) =>
        new Date(med.scheduleTime).getTime() >= now.getTime() &&
        new Date(med.scheduleTime).getTime() <= now.getTime() + 24 * 60 * 60 * 1000 // within next 24h
    );

    const missedDoses = meds.filter(
      (med) =>
        new Date(med.scheduleTime).getTime() < now.getTime() &&
        new Date(med.scheduleTime).getTime() >= now.getTime() - 48 * 60 * 60 * 1000 // missed in last 48h
    );

    const refillAlerts = meds
      .map((med) => ({
        name: med.name,
        status: this.getRefillStatus(med),
      }))
      .filter((r) => r.status.includes('low') || r.status.includes('Out'));

    return {
      upcomingDoses,
      missedDoses,
      refillAlerts,
    };
  }

async getScheduledWithin(start: Date, end: Date): Promise<Medication[]> {
  return this.prisma.medication.findMany({
    where: {
      scheduleTime: { gte: start, lte: end },
    },
  });
}


}
