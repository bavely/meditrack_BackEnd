import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from "../common/guards/gql-auth-guard"
// import { ParseMedicationLabelMultipleInput } from './dto/parse-multiple.input';
import { OcrService } from './ocr.service';
import { ParseMedicationLabelMultipleOutput } from './dto/parse-multiple.output';
import { ParseResponse } from './dto/parse-reponse';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
@Resolver()
export class OcrResolver {
    private readonly logger = new Logger(OcrResolver.name);
    constructor(private readonly ocrService: OcrService) { }

    @Mutation(() => ParseResponse)
    @UseGuards(GqlAuthGuard)
    async parseMedicationLabelMultiple(
        @Args('input', { type: () => [GraphQLUpload] }) input: FileUpload[],
    ) {
        this.logger.debug(`Received ${input.length} file(s) for OCR parsing`);

        const result = await this.ocrService.parseMultiple(input);
        return {
            success: true,
            error: null,
            data: result
        };
    }
}

