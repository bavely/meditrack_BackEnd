import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 5 }));
  app.enableCors({
    origin:  '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight', 'x-apollo-operation-name'],
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
