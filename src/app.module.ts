import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MedicationModule } from './medication/medication.module';
import { AiModule } from './ai/ai.module';
import { UserModule } from './user/user.module';
import { ReminderModule } from './reminder/reminder.module';
import { GraphqlExceptionInterceptor } from './common/interceptors/graphql-exception.interceptor';
import { OcrModule } from './ocr/ocr.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    MedicationModule,
    AiModule,
    ReminderModule,
    UserModule,
    OcrModule,
    // NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: GraphqlExceptionInterceptor,
    }
  ],
})
export class AppModule {}
