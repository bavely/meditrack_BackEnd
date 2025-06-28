import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsDateString, IsInt, Min } from 'class-validator';

@InputType()
export class AddMedicationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @Field()
  @IsDateString()
  scheduleTime: string; // ISO string like "2025-06-28T09:00:00Z"

  @Field()
  @IsInt()
  @Min(1)
  durationDays: number;

  @Field()
  @IsInt()
  @Min(1)
  quantity: number; // total pills provided
}
