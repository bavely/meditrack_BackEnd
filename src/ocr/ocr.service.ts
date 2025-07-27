import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import type { FileUpload } from 'graphql-upload-ts';
import { createWorker } from 'tesseract.js';
import { Readable } from 'stream';
import * as sharp from 'sharp'; // For image buffer validation
import { ParseMedicationLabelMultipleOutput } from './dto/parse-multiple.output';
import { AiService } from 'src/ai/ai.service';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly worker = createWorker(); // Tesseract worker initialized once

  constructor(private readonly aiService: AiService) {}

  /** Convert Readable to Buffer */
  private streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /** Validate buffer is a valid image using sharp */
  private async validateImageBuffer(buffer: Buffer, filename: string) {
    try {
      await sharp(buffer).metadata(); // will throw if invalid
    } catch (error) {
      this.logger.error(`[OCR] Invalid image buffer: ${filename}`);
      throw new BadRequestException(`Invalid or corrupted image: ${filename}`);
    }
  }

  /** Run OCR on a list of image files */
  private async ocrImages(files: FileUpload[]): Promise<string[]> {
    const worker = await this.worker;
    await worker.reinitialize('eng'); // Reinitialize language only (load is deprecated)

    const results: string[] = [];

    for (const file of files) {
      const { createReadStream, filename } = file;
      const stream = createReadStream();
      const buffer = await this.streamToBuffer(stream);

      await this.validateImageBuffer(buffer, filename);
      this.logger.debug(`[OCR] Running OCR on file: ${filename}`);

      try {
        const {
          data: { text },
        } = await worker.recognize(buffer);
        results.push(text);
      } catch (err) {
        this.logger.error(`[OCR] Failed OCR on file: ${filename}`, err);
        throw new BadRequestException(`Failed to process image: ${filename}`);
      }
    }

    await worker.terminate(); // Clean up worker
    return results;
  }

  /** Remove PHI and noisy content */
  private sanitizeText(fullText: string): string {
    return fullText
      .replace(/\b[A-Z]{2,}\d{2,}\b/g, '') // remove codes like RX22
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '') // remove dates
      .replace(/[^\x00-\x7F]/g, '') // remove non-ASCII
      .trim();
  }

  /** Send sanitized label to OpenAI */
  private async callAiParser(sanitized: string) {
    const systemPrompt = `
You are a medication parser. Given a scanned label text, extract JSON:
{ name: string, dosage: string, quantity?: number,
  instructions?: string, therapy?: string,
  schedule: { repeatPattern: string, times: string[], startDate: string, durationDays: number } }
Return ONLY valid JSON. No explanation.
`.trim();

    const userPrompt = `Label text:\n"""\n${sanitized}\n"""`;

    this.logger.debug('Sending sanitized text to OpenAI...');
    return this.aiService.askAi(systemPrompt, userPrompt);
  }

  /** Public API: process multiple uploaded images */
  async parseMultiple(
    input: FileUpload[],
  ): Promise<ParseMedicationLabelMultipleOutput> {
    const files = await Promise.all(input);
    this.logger.debug(`OCR on ${files.length} images…`);

    const texts = await this.ocrImages(files);
    const stitched = texts.join('\n---\n');
    const sanitized = this.sanitizeText(stitched);

    const parsed = await this.callAiParser(sanitized);
    this.logger.debug('AI Parsing result:', parsed);

    return parsed as ParseMedicationLabelMultipleOutput;
  }
}
