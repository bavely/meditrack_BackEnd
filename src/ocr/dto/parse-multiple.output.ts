// src/image-processing/dto/parse-multiple.output.ts
import { Field, ObjectType } from '@nestjs/graphql';



@ObjectType()
export class ParseMedicationLabelMultipleOutput {
  @Field()
  name: string;

  @Field()
  dosage: string;

  @Field({ nullable: true })
  quantity?: number;

  @Field({ nullable: true })
  instructions?: string;

  @Field({ nullable: true })
  therapy?: string;
}
