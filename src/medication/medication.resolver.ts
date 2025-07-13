import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { MedicationService } from './medication.service';
import { AddMedicationInput } from './dto/add-medication.input';
import { Medication } from './models/medication.model';
import { DashboardOutput } from './dto/dashboard-output.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Resolver(() => Medication)
export class MedicationResolver {
  constructor(private readonly medicationService: MedicationService) {}


}
