import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { User } from 'src/entity/user/user.entity';
import { VerificationTokenGenerator } from '../helpers/verification-token-generator';
import { ConfigService } from '@nestjs/config';
import {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
} from 'src/api/inputs/user/user.input';
import { CurrentUser } from 'src/common/decorators/decorators';
import { IPayload } from 'src/common/interfaces/payload.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
    private verificationTokenGenerator: VerificationTokenGenerator,
  ) {}

  async createUser(input: CreateUserInput) {
    const { firstName, lastName, email, password } = input;

    const existing = await this.connection.getRepository(User).findOne({
      where: {
        email,
      },
    });

    if (existing) {
      throw new InternalServerErrorException('Email must be unique');
    }

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

    //TODO SEND EMAIL

    return await this.connection
      .getRepository(User)
      .save(user, { reload: false });
  }

  async updateUser(input: UpdateUserInput, @CurrentUser() user: IPayload) {
    const findUser = await this.connection
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email: user.email })
      .addSelect('user.password')
      .getOne();

    findUser.firstName = input.firstName;
    findUser.lastName = input.lastName;

    if (input.password) {
      findUser.password = await bcryptjs.hash(input.password, 10);
    }

    return await this.connection
      .getRepository(User)
      .save(findUser, { reload: false });
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
        return this.connection
          .getRepository(User)
          .save(user, { reload: false });
      } else {
        throw new BadRequestException('Verification Token Expired');
      }
    }
  }

  async setVerificationToken(user: User): Promise<User> {
    user.verificationToken = this.verificationTokenGenerator.generateVerificationToken();
    user.verified = false;
    return this.connection.manager.save(user);
  }

  async refreshVerificationToken(emailAddress: string): Promise<boolean> {
    const user = await this.getUserByEmailAddress(emailAddress);
    if (user && !user.verified) {
      await this.setVerificationToken(user);
      //TODO SEND EMAIL
      return true;
    }

    return false;
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
    return this.connection.getRepository(User).save(user, { reload: false });
  }

  async resetPasswordByToken(
    input: ResetPasswordInput,
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
        return this.connection
          .getRepository(User)
          .save(user, { reload: false });
      } else {
        throw new BadRequestException('Reset password Token Expired');
      }
    }
  }
}
