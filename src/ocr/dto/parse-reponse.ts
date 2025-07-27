import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ResponseType } from '../../common/dto/response.dto';
import { ParseMedicationLabelMultipleOutput } from './parse-multiple.output';

@ObjectType()
export class ParseResponse extends ResponseType<ParseMedicationLabelMultipleOutput>(ParseMedicationLabelMultipleOutput) {

}

    