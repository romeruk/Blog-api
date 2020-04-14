import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MailerModule } from '@nestjs-modules/mailer';
import { ApiModule } from './api/api.module';
import { databaseConfig } from './config/databse.config';
import { ServiceModule } from './service/service.module';
import { ApplicationConfig } from './config/app.config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { graphqlOptions } from './config/graphqlModule.options';
import { typeOrmAsyncOptions } from './config/typeOrmAsync.options';
import { mailerAsyncOptions } from './config/mailerAsync.options';

@Module({
  imports: [
    GraphQLModule.forRoot(graphqlOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, ApplicationConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncOptions),
    MailerModule.forRootAsync(mailerAsyncOptions),
    CloudinaryModule,
    ApiModule,
    ServiceModule,
  ],
})
export class AppModule {}
