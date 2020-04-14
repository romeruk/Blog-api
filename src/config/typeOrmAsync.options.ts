import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncOptions: TypeOrmModuleAsyncOptions = {
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
};
