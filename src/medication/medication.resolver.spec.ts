import { Test, TestingModule } from '@nestjs/testing';
import { MedicationResolver } from './medication.resolver';

describe('MedicationResolver', () => {
  let resolver: MedicationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicationResolver],
    }).compile();

    resolver = module.get<MedicationResolver>(MedicationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
