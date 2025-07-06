// src/common/guards/gql-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    console.log('GqlAuthGuard getRequest called');
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req; // critical: returns request object for Passport
  }
}
