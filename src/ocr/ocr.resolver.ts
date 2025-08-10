import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '../common/guards/gql-auth-guard';
// import { ParseMedicationLabelMultipleInput } from './dto/parse-multiple.input';
import { OcrService } from './ocr.service';
import { ParseMedicationLabelMultipleOutput } from './dto/parse-multiple.output';
import { ParseResponse } from './dto/parse-reponse';
import { UnwrapCylindricalLabelResponse } from './dto/unwrap.response';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';
@Resolver()
export class OcrResolver {
  private readonly logger = new Logger(OcrResolver.name);
  constructor(private readonly ocrService: OcrService) {}

  @Mutation(() => ParseResponse)
  @UseGuards(GqlAuthGuard)
  async parseMedicationLabelMultiple(
    @Args('input', { type: () => [GraphQLUpload] }) input: FileUpload[],
  ) {
    this.logger.debug(`Received ${input.length} file(s) for OCR parsing`);

    const result = await this.ocrService.parseMultiple(input);
    return {
      success: true,
      errors: [],
      data: result,
    };
  }

  @Mutation(() => UnwrapCylindricalLabelResponse)
  @UseGuards(GqlAuthGuard)
  async unwrapCylindricalLabel(
    @Args('image', { type: () => GraphQLUpload }) image: FileUpload,
  ) {
    this.logger.debug('Received image for cylindrical unwrapping');
    // Convert FileUpload to Express.Multer.File-like object
    const { filename, mimetype, encoding } = image;
    const chunks: Buffer[] = [];
    const stream = image.createReadStream();
    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });
    const buffer = Buffer.concat(chunks);
    const file: Express.Multer.File = {
      fieldname: 'image',
      originalname: filename,
      encoding,
      mimetype,
      size: buffer.length,
      buffer,
      stream,
      destination: '',
      filename,
      path: '',
    };
    const result = await this.ocrService.unwrapCylindricalLabel(file);
    return {
      success: true,
      errors: [],
      data: result,
    };
  }
}
