import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddMedicationInput } from './dto/add-medication.input';
import { Medication } from '@prisma/client';

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  

 


}
