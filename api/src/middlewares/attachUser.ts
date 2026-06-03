import type { RequestHandler, Request } from 'express';
import { prisma } from '../db/prisma';
import type { AuthTokenPayload } from '../types/auth';
import { HttpError } from '../utils/httpError';

export const attachUser: RequestHandler = async (req, _res, next) => {
  const r = req as Request & { auth?: AuthTokenPayload; user?: { id: string; email?: string; name?: string; role?: string } };

  if (!r.auth) {
    
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: r.auth.sub },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      throw new HttpError(401, 'User not found');
    }

    r.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      role: user.role as unknown as string
    };
    next();
  } catch (err) {
    next(err);
  }
};
