import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { Response } from 'express';
import ms from 'ms';
import { Connection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { UserLogInInput } from 'src/api/inputs/user/user.input';
import { User } from 'src/entity/user/user.entity';
import { UserType } from 'src/api/types/user/user.type';
import { ResGql } from 'src/common/decorators/decorators';
import { IPayload } from 'src/common/interfaces/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @InjectConnection() private connection: Connection,
  ) {}

  async logIn(
    input: UserLogInInput,
    @ResGql() res: Response,
  ): Promise<UserType> {
    const { email, password } = input;

    const isVerificationRequired = this.configService.get<boolean>(
      'app.verificationRequired',
    );

    const jwtTokenDuration = this.configService.get<string>(
      'app.jwtTokenDuration',
    );

    const user = await this.connection
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('user email or password invalid');
    }

    if (isVerificationRequired && !user.verified) {
      throw new UnauthorizedException('user verification is required');
    }

    const currectPassword = await bcryptjs.compare(password, user.password);

    if (!currectPassword) {
      throw new UnauthorizedException('user email or password invalid');
    }

    const payload: IPayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const jwt = this.jwtService.sign(payload);

    res.cookie('token', jwt, {
      httpOnly: true,
      expires: new Date(Date.now() + ms(jwtTokenDuration)),
    });

    return user;
  }
}
