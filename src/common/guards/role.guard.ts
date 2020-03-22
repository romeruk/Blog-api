import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AdminGqlGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdmin = this.reflector.get<boolean>(
      'isAdminAccess',
      context.getHandler(),
    );

    if (isAdmin == null) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const user = req.user;

    if (user.isAdmin !== isAdmin) {
      return false;
    }

    return true;
  }
}
