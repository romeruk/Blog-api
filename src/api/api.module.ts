import { Module } from '@nestjs/common';
import { UserResolver } from './resolvers/user.resolver';
import { UserService } from 'src/service/services/user.service';
import { VerificationTokenGenerator } from 'src/service/helpers/verification-token-generator';

@Module({
  providers: [VerificationTokenGenerator, UserService, UserResolver],
})
export class ApiModule {}
