import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { User } from 'src/entity/user/user.entity';
import { VerificationTokenGenerator } from '../helpers/verification-token-generator';
import { ConfigService } from '@nestjs/config';
import {
  CreateUserInput,
  resetPasswordInput,
} from 'src/api/inputs/user/user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
    private verificationTokenGenerator: VerificationTokenGenerator,
  ) {}

  async createUser(input: CreateUserInput) {
    const { firstName, lastName, email, password } = input;

    const isVerificationRequired = this.configService.get<boolean>(
      'app.verificationRequired',
    );

    const user = new User();

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await bcryptjs.hash(password, 10);
    user.email = email;
    user.isAdmin = false;
    if (isVerificationRequired) {
      user.verificationToken = this.verificationTokenGenerator.generateVerificationToken();
      user.verified = false;
    } else {
      user.verified = true;
    }

    //todo SEND EMAIL

    return await this.connection.manager.save(user);
  }

  async verifyUserByToken(
    verificationToken: string,
  ): Promise<User | undefined> {
    const user = await this.connection.getRepository(User).findOne({
      where: { verificationToken },
    });
    if (user) {
      if (
        this.verificationTokenGenerator.verifyVerificationToken(
          verificationToken,
        )
      ) {
        user.verificationToken = null;
        user.verified = true;
        return this.connection.getRepository(User).save(user);
      } else {
        throw new BadRequestException('Verification Token Expired');
      }
    }
  }

  async getUserByEmailAddress(emailAddress: string): Promise<User | undefined> {
    return this.connection.getRepository(User).findOne({
      where: {
        email: emailAddress,
      },
    });
  }

  async setPasswordResetToken(emailAddress: string): Promise<User | undefined> {
    const user = await this.getUserByEmailAddress(emailAddress);
    if (!user) {
      return;
    }
    user.passwordResetToken = this.verificationTokenGenerator.generateVerificationToken();
    //todo SEND EMAIL
    return this.connection.getRepository(User).save(user);
  }

  async resetPasswordByToken(
    input: resetPasswordInput,
  ): Promise<User | undefined> {
    const { passwordResetToken, password } = input;
    const user = await this.connection.getRepository(User).findOne({
      where: { passwordResetToken },
    });

    if (user) {
      if (
        this.verificationTokenGenerator.verifyVerificationToken(
          passwordResetToken,
        )
      ) {
        user.password = await bcryptjs.hash(password, 10);
        user.passwordResetToken = null;
        return this.connection.getRepository(User).save(user);
      } else {
        throw new BadRequestException('Reset password Token Expired');
      }
    }
  }
}
