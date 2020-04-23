import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const databaseConfig = registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASENAME,
    entities: [
      join(__dirname, '/../**/*.entity.{js,ts}'),
      join(__dirname, '/dist/**/*.entity.js'),
    ],
    synchronize: false,
    migrations: [join(__dirname, '../migrations/**/*.{js,ts}')],
    subscribers: [join(__dirname, '../subscriber/**/*.{js,ts}')],
    cli: {
      entitiesDir: 'src',
      migrationsDir: 'src/migrations',
      subscribersDir: 'src/subscriber',
    },
  }),
);

export const databaseTestConfig = registerAs(
  'databasedev',
  (): TypeOrmModuleOptions => ({
    ...databaseConfig(),
    synchronize: true,
    dropSchema: true,
  }),
);
