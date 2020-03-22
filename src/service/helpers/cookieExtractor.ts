import { Request } from 'express';

export const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }

  return token;
};
