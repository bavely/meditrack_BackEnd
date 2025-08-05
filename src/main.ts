import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 5 }));

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin && origin !== '*');

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: allowedOrigins.length > 0,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'apollo-require-preflight',
      'x-apollo-operation-name',
    ],
  });
  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
