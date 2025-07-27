import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from "../common/guards/gql-auth-guard"
// import { ParseMedicationLabelMultipleInput } from './dto/parse-multiple.input';
import { OcrService } from './ocr.service';
import { ParseMedicationLabelMultipleOutput } from './dto/parse-multiple.output';
import { ParseResponse } from './dto/parse-reponse';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
@Resolver()
export class OcrResolver {
    constructor(private readonly ocrService: OcrService) { }

    @Mutation(() => ParseResponse)
    @UseGuards(GqlAuthGuard)
    async parseMedicationLabelMultiple(
        @Args('input', { type: () => [GraphQLUpload] }) input: FileUpload[],
    ) {
        console.log(input);

        const result = await this.ocrService.parseMultiple(input);
        return {
            success: true,
            error: null,
            data: result
        };
    }
}
