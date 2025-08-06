import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('unwrap')
  @UseInterceptors(FileInterceptor('file'))
  async unwrap(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.ocrService.unwrapCylindricalLabel(file);
    return { imageUrl };
  }
}
