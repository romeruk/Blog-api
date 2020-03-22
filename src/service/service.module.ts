import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

import { VerificationTokenGenerator } from './helpers/verification-token-generator';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth/jwt.strategy';

const services = [UserService, AuthService];

const modules = [
  PassportModule,
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      return {
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwtTokenDuration'),
        },
      };
    },
  }),
];

const Exports = [JwtModule];

@Module({
  imports: [...modules],
  providers: [VerificationTokenGenerator, ...services, JwtStrategy],
  exports: [...Exports],
})
export class ServiceModule {}
