import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler';
import { HttpError } from '../utils/httpError';
import { env } from '../config/env';
import { prisma } from '../db/prisma';
import { sendPasswordResetEmail } from '../services/mailService';

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  if (!email) throw new HttpError(400, 'Email required');


  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      
      if (!user.passwordHash) {
        console.log(`forgotPassword: account ${email} is oauth-only, instructing to use Google login`);
        return res.json({ ok: true, message: 'Esta cuenta fue creada con Google. Inicia sesión con Google.' });
      } else {
        const token = jwt.sign({ sub: user.id, purpose: 'pwd_reset' }, env.JWT_RESET_SECRET, { expiresIn: `${env.PASSWORD_RESET_TTL_HOURS}h` });
        await sendPasswordResetEmail(user.email, token);
      }
    }
  } catch (err) {
    console.error('forgotPassword error', err);
  }

  res.json({ ok: true });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body ?? {};
  if (!token || !newPassword) throw new HttpError(400, 'Token and newPassword required');

  let payload: any;
  try {
    payload = jwt.verify(token, env.JWT_RESET_SECRET) as any;
  } catch (err) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  if (payload.purpose !== 'pwd_reset' || !payload.sub) throw new HttpError(401, 'Invalid token');

  const userId: string = payload.sub;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

  
  await prisma.refreshToken.deleteMany({ where: { userId } });

  res.json({ ok: true });
});
