import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApiModule } from './api/api.module';
import { databaseConfig } from './config/databse.config';
import { ServiceModule } from './service/service.module';
import { ApplicationConfig } from './config/app.config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, ApplicationConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: configService.get('database.type'),
          host: configService.get('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.database'),
          entities: configService.get<string[]>('database.entities'),
          migrations: configService.get<string[]>('database.migrations'),
          cli: configService.get('database.cli'),
        };
      },
    }),
    CloudinaryModule,
    ApiModule,
    ServiceModule,
  ],
})
export class AppModule {}
