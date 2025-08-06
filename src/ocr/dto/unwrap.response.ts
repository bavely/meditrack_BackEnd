import { ObjectType } from '@nestjs/graphql';
import { ResponseType } from '../../common/dto/response.dto';
import { UnwrapCylindricalLabelOutput } from './unwrap.output';

@ObjectType()
export class UnwrapCylindricalLabelResponse extends ResponseType<UnwrapCylindricalLabelOutput>(
  UnwrapCylindricalLabelOutput,
) {}
