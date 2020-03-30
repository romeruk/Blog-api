import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';
import { Any } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      validationError: {
        value: false,
        target: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const trasformedErrros = errors.map(error => {
          return {
            name: error.property,
            message: Object.values(error.constraints).join('\n'),
          };
        });

        return new BadRequestException(trasformedErrros);
      },
    }),
  );

  app.use(cookieParser());
  await app.listen(5000);
}
bootstrap();
