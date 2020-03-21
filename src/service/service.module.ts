import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { VerificationTokenGenerator } from './helpers/verification-token-generator';

@Module({
  providers: [UserService, VerificationTokenGenerator],
})
export class ServiceModule {}
