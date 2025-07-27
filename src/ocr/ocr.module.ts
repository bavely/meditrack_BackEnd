import { Module } from '@nestjs/common';
import { OcrResolver } from './ocr.resolver';
import { OcrService } from './ocr.service';
import { AiModule } from '../ai/ai.module';
import { AiService } from '../ai/ai.service';

@Module({
  providers: [OcrResolver, OcrService, AiService],
  imports: [AiModule],
})
export class OcrModule {}
