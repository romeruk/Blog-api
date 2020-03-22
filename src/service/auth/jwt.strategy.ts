import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserService } from '../services/user.service';
import { cookieExtractor } from '../helpers/cookieExtractor';
import { IPayload } from 'src/common/interfaces/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: IPayload) {
    const { email } = payload;
    return this.userService.getUserByEmailAddress(email);
  }
}
