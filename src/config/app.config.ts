import { registerAs } from '@nestjs/config';

export const ApplicationConfig = registerAs('app', () => ({
  verificationTokenDuration: '7d',
  verificationRequired: true,
  jwtTokenDuration: '30m',
}));
