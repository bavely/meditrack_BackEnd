import { Module } from '@nestjs/common';
import { MedicationService } from './medication.service';
import { MedicationResolver } from './medication.resolver';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule],
  providers: [MedicationService, MedicationResolver],
  exports: [MedicationService],
})
export class MedicationModule {}
