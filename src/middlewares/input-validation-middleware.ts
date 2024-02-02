import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { HTTP_STATUSES } from '../utils';

export const inputValidatonMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }

  next();
};
