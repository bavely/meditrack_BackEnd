import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  OnModuleDestroy,
} from '@nestjs/common';
import type { FileUpload } from 'graphql-upload-ts';
import { createWorker, Worker } from 'tesseract.js';
import { Readable } from 'stream';
import * as sharp from 'sharp'; // For image buffer validation

import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import type { Express } from 'express';

import { ParseMedicationLabelMultipleOutput } from './dto/parse-multiple.output';
import { AiService } from '../ai/ai.service';

@Injectable()
export class OcrService implements OnModuleDestroy {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null; // Persist worker across requests

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

  /** Get or create the singleton Tesseract worker */
  private async getWorker(): Promise<Worker> {
    if (!this.worker) {
      try {
        const worker = await createWorker();
        await worker.load();
        if (
          'initialize' in worker &&
          typeof (worker as any).initialize === 'function'
        ) {
          await (worker as any).initialize('eng');
        } else {
          await worker.reinitialize('eng');
        }
        this.worker = worker;
      } catch (error) {
        this.logger.error('[OCR] Failed to initialize worker', error);
        throw new InternalServerErrorException(
          'Failed to initialize OCR worker',
        );
      }
    }

    return this.worker;
  }

  /** Run OCR on a list of image files */
  private async ocrImages(files: FileUpload[]): Promise<string[]> {
    const worker = await this.getWorker();

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

    return results;
  }

  /** Gracefully terminate the Tesseract worker on shutdown */
  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
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

  /**
   * Accepts a cylindrical video label and converts it into a flattened image.
   * Returns a public URL to the generated JPEG under /uploads.
   */
  async unwrapCylindricalLabel(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const tempDir = tmpdir();
    const tempVideoPath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
    await fs.writeFile(tempVideoPath, file.buffer);

    const framePath = path.join(tempDir, `${Date.now()}-frame.png`);
    const ffmpegMod = await import('fluent-ffmpeg');
    const ffmpeg = ffmpegMod.default || ffmpegMod;
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .frames(1)
        .output(framePath)
        .on('end', () => resolve())
        .on('error', reject)
        .run();
    });

    const cvMod = await import('opencv4nodejs');
    const cv = cvMod.default || cvMod;
    const src = cv.imread(framePath);
    const center = new cv.Point2(src.cols / 2, src.rows / 2);
    const radius = Math.min(src.cols, src.rows) / 2;
    const unwrapped = src.warpPolar(
      new cv.Size(src.cols, src.rows),
      center,
      radius,
      cv.INTER_LINEAR + cv.WARP_FILL_OUTLIERS + cv.WARP_INVERSE_MAP,
    );

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const outputFilename = `${Date.now()}.jpg`;
    const outputPath = path.join(uploadsDir, outputFilename);
    cv.imwrite(outputPath, unwrapped);

    await fs.unlink(tempVideoPath).catch(() => undefined);
    await fs.unlink(framePath).catch(() => undefined);

    const baseUrl = (process.env.GRAPHQL_API_URL || '').replace(/\/$/, '');
    return `${baseUrl}/uploads/${outputFilename}`;
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

  /**
   * Unwrap a cylindrical label image and parse its text.
   * Currently acts as a passthrough while returning a local image URL.
   */
  async unwrapCylindricalLabel(
    image: FileUpload,
  ): Promise<{
    imageUrl: string;
    parsed?: ParseMedicationLabelMultipleOutput;
  }> {
    const file = await image;
    const { createReadStream, filename, mimetype, encoding } = file;

    const buffer = await this.streamToBuffer(createReadStream());
    await this.validateImageBuffer(buffer, filename);

    const outDir = join(process.cwd(), 'unwrapped');
    await fs.promises.mkdir(outDir, { recursive: true });
    const ts = Date.now();
    const outPath = join(outDir, `${ts}-${filename}`);
    await fs.promises.writeFile(outPath, buffer);

    const upload: FileUpload = {
      filename: `${ts}-${filename}`,
      mimetype: mimetype ?? 'image/png',
      encoding: encoding ?? '7bit',
      createReadStream: () => fs.createReadStream(outPath),
    } as unknown as FileUpload;

    const parsed = await this.parseMultiple([upload]);

    return { imageUrl: outPath, parsed };
  }
}
