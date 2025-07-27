import { registerEnumType } from '@nestjs/graphql';

export enum RepeatPattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

registerEnumType(RepeatPattern, {
  name: 'RepeatPattern',
  description: 'Repeat pattern for medication schedule',
});
