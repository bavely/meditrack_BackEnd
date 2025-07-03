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

  @Mutation(() => Medication)
  @UseGuards(AuthGuard('jwt'))
  async addMedication(
    @Args('input') input: AddMedicationInput,
    @Context('req') req
  ): Promise<Medication> {
    return this.medicationService.create(input , req.userId) ;
  }

  @Query(() => [Medication])
  @UseGuards(AuthGuard('jwt'))
  async myMedications(@Context('req') req): Promise<Medication[]> {
    console.log('User ID:', req.user);
    return this.medicationService.findByUser(req.userId);
  }

  @Query(() => DashboardOutput)
  @UseGuards(AuthGuard('jwt'))
  async dashboard(@Context('req') req): Promise<DashboardOutput> {
    const meds = await this.medicationService.findByUser(req.userId);

    return {
      upcomingDoses: meds.filter(med => {
        const now = new Date();
        return (
          new Date(med.scheduleTime).getTime() >= now.getTime() &&
          new Date(med.scheduleTime).getTime() <= now.getTime() + 24 * 60 * 60 * 1000 // within next 24h
        );
      }),
      missedDoses: meds.filter(med => {
        const now = new Date();
        return (
          new Date(med.scheduleTime).getTime() < now.getTime() &&
          new Date(med.scheduleTime).getTime() >= now.getTime() - 48 * 60 * 60 * 1000 // missed in last 48h
        );
      }),
      refillAlerts: meds
        .map(med => ({
          name: med.name,
          status: this.medicationService.getRefillStatus(med),
        }))
        .filter(refill => refill.status.includes('low') || refill.status.includes('Out')),
    };
  }
}
