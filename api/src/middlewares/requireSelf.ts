import type { RequestHandler, Request } from 'express';
import { HttpError } from '../utils/httpError';
import type { AuthTokenPayload } from '../types/auth';


export const requireSelf: RequestHandler = (req, _res, next) => {
  const r = req as Request & { auth?: AuthTokenPayload; user?: { id: string } };
  if (!r.auth) {
    throw new HttpError(401, 'Unauthorized');
  }

  const paramId = req.params.id;
  if (!paramId) {
    throw new HttpError(400, 'Missing id parameter');
  }

  if (r.auth.sub !== paramId) {
    throw new HttpError(403, 'Forbidden');
  }

  next();
};
