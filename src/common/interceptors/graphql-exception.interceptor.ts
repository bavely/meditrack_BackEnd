// // src/common/interceptors/graphql-exception.interceptor.ts
// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { GqlContextType } from '@nestjs/graphql';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';
// import { FieldError } from '../dto/field-error.dto';

// @Injectable()
// export class GraphqlExceptionInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     // Only apply to GraphQL requests
//     if (context.getType<GqlContextType>() !== 'graphql') {
//       return next.handle();
//     }

//     return next.handle().pipe(
//       // Wrap successful plain returns into the envelope
//       map((result) => {
//         // If already wrapped, pass through
//         if (
//           result != null &&
//           typeof result === 'object' &&
//           'success' in result &&
//           'errors' in result
//         ) {
//           return result;
//         }
//         // Otherwise wrap it as data
//         return { success: true, errors: [], data: result };
//       }),
//       // Catch thrown errors and wrap them
//       catchError((err) =>
//         throwError(() => ({
//           success: false,
//           errors: [
//             {
//               field: err.extensions?.field || 'unknown',
//               message: err.message || 'Internal server error',
//             } as FieldError,
//           ],
//           data: null,
//         })),
//       ),
//     );
//   }
// }


// src/common/interceptors/graphql-exception.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GraphQLError } from 'graphql';
import { FieldError } from '../dto/field-error.dto';

@Injectable()
export class GraphqlExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return next.handle();
    }
    return next.handle().pipe(
      map((result) => {
        if (
          result != null &&
          typeof result === 'object' &&
          'success' in result &&
          'errors' in result
        ) {
          return result;
        }
        return { success: true, errors: [], data: result };
      }),
      catchError((err) => {
        // build your envelope
        const envelope = {
          success: false,
          errors: [
            {
              field: err.extensions?.field || 'unknown',
              message: err.message || 'Internal server error',
            } as FieldError,
          ],
          data: null,
        };
        // throw a real GraphQLError with your envelope in extensions
        throw new GraphQLError(envelope.errors[0].message, {
          extensions: envelope,
        });
      }),
    );
  }
}
