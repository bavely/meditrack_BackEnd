import { Test, TestingModule } from '@nestjs/testing';
import { OcrResolver } from './ocr.resolver';

describe('OcrResolver', () => {
  let resolver: OcrResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrResolver],
    }).compile();

    resolver = module.get<OcrResolver>(OcrResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
