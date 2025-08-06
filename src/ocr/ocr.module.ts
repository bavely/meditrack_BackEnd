import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OcrResolver } from './ocr.resolver';
import { OcrService } from './ocr.service';
import { AiModule } from '../ai/ai.module';
import { AiService } from '../ai/ai.service';
import { OcrController } from './ocr.controller';

@Module({
  providers: [OcrResolver, OcrService, AiService],
  controllers: [OcrController],
  imports: [
    AiModule,
    MulterModule.register({}),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class OcrModule {}
