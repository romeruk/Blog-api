import { registerAs } from '@nestjs/config';

export const ApplicationConfig = registerAs('app', () => ({
  verificationTokenDuration: '1m',
  verificationRequired: true,
  jwtTokenDuration: '30m',
}));
