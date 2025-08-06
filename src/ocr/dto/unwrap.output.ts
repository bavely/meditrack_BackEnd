import { Field, ObjectType } from '@nestjs/graphql';
import { ParseMedicationLabelMultipleOutput } from './parse-multiple.output';

@ObjectType()
export class UnwrapCylindricalLabelOutput {
  @Field()
  imageUrl: string;

  @Field(() => ParseMedicationLabelMultipleOutput, { nullable: true })
  parsed?: ParseMedicationLabelMultipleOutput;
}
