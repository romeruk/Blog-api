import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { User, UserRole } from 'src/entity/user/user.entity';
import { VerificationTokenGenerator } from '../helpers/verification-token-generator';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
} from 'src/api/inputs/user/user.input';
import { CurrentUser } from 'src/common/decorators/decorators';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { Users } from 'src/api/types/user/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private connection: Connection,
    private configService: ConfigService,
    private verificationTokenGenerator: VerificationTokenGenerator,
    private readonly mailerService: MailerService,
  ) {}

  async createUser(
    input: CreateUserInput,
    role = UserRole.USER,
    @CurrentUser() currentUser: IPayload | null = null,
  ) {
    const { firstName, lastName, email, password } = input;

    const existing = await this.getUserByEmailAddress(email);

    if (existing) {
      throw new InternalServerErrorException([
        {
          name: 'email',
          message: 'email should be unique',
        },
      ]);
    }

    if (currentUser) {
      if (currentUser.role === UserRole.ADMIN && role === UserRole.SUPERADMIN) {
        throw new InternalServerErrorException([
          {
            name: 'role',
            message:
              'User with role "SUPERADMIN" can only be created by superadmin user',
          },
        ]);
      }
    }

    const isVerificationRequired = this.configService.get<boolean>(
      'app.verificationRequired',
    );

    const user = new User();

    user.firstName = firstName;
    user.lastName = lastName;
    user.password = await bcryptjs.hash(password, 10);
    user.email = email;
    user.role = role;

    if (isVerificationRequired) {
      const frontUrl = this.configService.get<string>('FRONT_URL');
      const token = this.verificationTokenGenerator.generateVerificationToken();
      user.verificationToken = token;
      user.verified = false;

      const success = await this.mailerService.sendMail({
        to: `${user.email}`,
        from: 'nestjsblogapi@gmail.com',
        subject: 'User registration',
        template: 'email',
        context: {
          username: `${firstName} ${lastName}`,
          url: `${frontUrl}/verify/${token}`,
          linkText: 'Verify my account',
        },
      });

      if (!success) {
        throw new InternalServerErrorException([
          {
            name: 'email',
            message: 'Error sending verification token',
          },
        ]);
      }
    } else {
      user.verified = true;
    }

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

  async removeUser(email: string, @CurrentUser() currUser: IPayload) {
    if (currUser.email === email) {
      throw new BadRequestException('You cannot remove yourself');
    }

    const user = await this.getUserByEmailAddress(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currUser.role === UserRole.ADMIN &&
      (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN)
    ) {
      throw new BadRequestException('Only Super Admin can remove other admins');
    }

    const removedUser = await this.connection
      .getRepository(User)
      .softRemove(user);

    return removedUser;
  }

  async recoverUser(email: string, @CurrentUser() currUser: IPayload) {
    const user = await this.getUserByEmailAddress(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      currUser.role === UserRole.ADMIN &&
      (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN)
    ) {
      throw new BadRequestException(
        'Only Super Admin can recover other admins',
      );
    }

    const restoredCategory = await this.connection
      .getRepository(User)
      .recover(user);

    return restoredCategory;
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
        throw new BadRequestException([
          {
            name: 'token',
            message: 'Verification token expired',
          },
        ]);
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

    if (!user) {
      throw new BadRequestException([
        {
          name: 'email',
          message: 'Invalid email address',
        },
      ]);
    }

    if (user && !user.verified) {
      const restoredUser = await this.setVerificationToken(user);

      const frontUrl = this.configService.get<string>('FRONT_URL');

      const success = await this.mailerService.sendMail({
        to: `${user.email}`,
        from: 'nestjsblogapi@gmail.com',
        subject: 'Verify account',
        template: 'email',
        context: {
          username: `${user.firstName} ${user.lastName}`,
          url: `${frontUrl}/verify/${restoredUser.verificationToken}`,
          linkText: 'Verify my account',
        },
      });

      if (!success) {
        throw new InternalServerErrorException([
          {
            name: 'passwordResetToken',
            message: 'Error sending restore password token',
          },
        ]);
      }
    }

    return true;
  }

  async getUserByEmailAddress(emailAddress: string): Promise<User | undefined> {
    return this.connection.getRepository(User).findOne({
      withDeleted: true,
      where: {
        email: emailAddress,
      },
    });
  }

  async getMe(@CurrentUser() user: IPayload) {
    return await this.getUserByEmailAddress(user.email);
  }

  async setPasswordResetToken(emailAddress: string): Promise<User> {
    const user = await this.getUserByEmailAddress(emailAddress);
    if (!user) {
      throw new BadRequestException([
        {
          name: 'email',
          message: 'Cannot send reset password token',
        },
      ]);
    }
    const token = this.verificationTokenGenerator.generateVerificationToken();
    user.passwordResetToken = token;

    const frontUrl = this.configService.get<string>('FRONT_URL');

    const success = await this.mailerService.sendMail({
      to: `${user.email}`,
      from: 'nestjsblogapi@gmail.com',
      subject: 'Restore password',
      template: 'email',
      context: {
        username: `${user.firstName} ${user.lastName}`,
        url: `${frontUrl}/resetpassword/${token}`,
        linkText: 'Restore password',
      },
    });

    if (!success) {
      throw new InternalServerErrorException([
        {
          name: 'passwordResetToken',
          message: 'Error sending restore password token',
        },
      ]);
    }

    return this.connection.getRepository(User).save(user, { reload: false });
  }

  async resetPasswordByToken(
    input: ResetPasswordInput,
  ): Promise<User | undefined> {
    const { passwordResetToken, password } = input;
    const user = await this.connection.getRepository(User).findOne({
      withDeleted: true,
      where: {
        passwordResetToken,
      },
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
        throw new BadRequestException([
          {
            name: 'passwordResetToken',
            message: 'Reset password Token Expired',
          },
        ]);
      }
    }
  }

  async findAll(limit = 10, page = 0): Promise<Users> {
    const [users, total] = await this.connection
      .getRepository(User)
      .findAndCount({
        skip: page > 0 ? (page - 1) * limit : 0,
        take: limit,
        withDeleted: true,
      });

    const foundUsers = new Users();
    foundUsers.users = users;
    foundUsers.total = total;

    return foundUsers;
  }
}
