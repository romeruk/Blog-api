import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

export const ResGql = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().res;
  },
);

export const isAdminAccess = (isAdmin: boolean) =>
  SetMetadata('isAdminAccess', isAdmin);
