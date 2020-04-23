import { Test } from '@nestjs/testing';
import { UserService } from '../../user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmTestAsyncOptions } from 'src/config/typeOrmAsync.options';
import { ConfigModule } from '@nestjs/config';
import { VerificationTokenGenerator } from 'src/service/helpers/verification-token-generator';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerAsyncOptions } from 'src/config/mailerAsync.options';
import { databaseTestConfig } from 'src/config/databse.config';
import { ApplicationConfig } from 'src/config/app.config';
import { IPayload } from 'src/common/interfaces/payload.interface';
import { UserRole } from 'src/entity/user/user.entity';
import * as bcryptjs from 'bcryptjs';

describe('User Service', () => {
  let userService: UserService;

  const defaultUser = {
    firstName: 'FirstName',
    lastName: 'LastName',
    email: 'test@gmail.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [databaseTestConfig, ApplicationConfig],
          envFilePath: ['.env.development'],
        }),
        TypeOrmModule.forRootAsync(typeOrmTestAsyncOptions),
        MailerModule.forRootAsync(mailerAsyncOptions),
      ],
      providers: [VerificationTokenGenerator, UserService],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
  });

  describe('Test methods', () => {
    it('Should create user', async () => {
      const createdUser = await userService.createUser(defaultUser);

      expect(createdUser.firstName).toEqual(defaultUser.firstName);
      expect(createdUser.lastName).toEqual(defaultUser.lastName);
      expect(createdUser.email).toEqual(defaultUser.email);
      expect(createdUser.verified).toBe(false);
      expect(createdUser.role).toBe(UserRole.USER);
    });

    it('Should remove user', async () => {
      const payload: IPayload = {
        firstName: '',
        lastName: '',
        email: '',
        role: UserRole.USER,
      };

      await userService.removeUser(defaultUser.email, payload);
      const user = await userService.getUserByEmailAddress(defaultUser.email);
      expect(user.deletedAt).toEqual(expect.any(Date));
    });

    it('Should recover user', async () => {
      const payload: IPayload = {
        firstName: '',
        lastName: '',
        email: '',
        role: UserRole.USER,
      };

      await userService.recoverUser(defaultUser.email, payload);
      const user = await userService.getUserByEmailAddress(defaultUser.email);
      expect(user.deletedAt).toBe(null);
    });

    it('Should refresh verification token', async () => {
      await userService.refreshVerificationToken(defaultUser.email);
      const user = await userService.getUserByEmailAddress(defaultUser.email);
      expect(user.verified).toBe(false);
      expect(user.verificationToken).toEqual(expect.any(String));
    });

    it('Should verify user by token', async () => {
      const user = await userService.getUserByEmailAddress(defaultUser.email);
      const verifiedUser = await userService.verifyUserByToken(
        user.verificationToken,
      );

      expect(verifiedUser.verified).toBe(true);
      expect(verifiedUser.verificationToken).toBe(null);
    });

    it('Should not refresh verification Token', async () => {
      await userService.refreshVerificationToken(defaultUser.email);
      const user = await userService.getUserByEmailAddress(defaultUser.email);
      expect(user.verified).toBe(true);
      expect(user.verificationToken).toBe(null);
    });

    it('Should return me', async () => {
      const payload: IPayload = {
        firstName: '',
        lastName: '',
        email: defaultUser.email,
        role: UserRole.USER,
      };

      const me = await userService.getMe(payload);

      expect(me.firstName).toEqual(defaultUser.firstName);
      expect(me.lastName).toEqual(defaultUser.lastName);
      expect(me.email).toEqual(defaultUser.email);
    });

    it('Should set restore password token', async () => {
      const user = await userService.setPasswordResetToken(defaultUser.email);
      expect(user.passwordResetToken).toEqual(expect.any(String));
    });

    it('Should restore password by token', async () => {
      const user = await userService.getUserByEmailAddress(defaultUser.email);

      const newData = {
        passwordResetToken: user.passwordResetToken,
        password: '1234567',
      };

      const newUser = await userService.resetPasswordByToken(newData);

      const comparedPassword = await bcryptjs.compare(
        newData.password,
        newUser.password,
      );

      expect(comparedPassword).toBe(true);
    });

    it('Should update user data', async () => {
      const input = {
        firstName: 'TEST2',
        lastName: 'test2',
        password: '123456789',
      };

      const payload: IPayload = {
        firstName: 'FirstName',
        lastName: 'LastName',
        email: defaultUser.email,
        role: UserRole.USER,
      };

      const user = await userService.updateUser(input, payload);

      const comparedPassword = await bcryptjs.compare(
        input.password,
        user.password,
      );

      expect(comparedPassword).toBe(true);
      expect(user.firstName).toEqual(input.firstName);
      expect(user.lastName).toEqual(input.lastName);
    });
  });
});
