import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";
import bcrypt from "bcryptjs";


export const getUserById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, passwordHash: true } });
  if (!user) throw new HttpError(404, "User not found");
  const { passwordHash, ...rest } = user;
  res.json({ ...rest, hasPassword: !!passwordHash });
};

export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, role } = req.body ?? {};
  await prisma.user.update({ where: { id }, data: { name, role } });
  res.json({ ok: true });
};

export const changePassword = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body ?? {};

  if (!newPassword || newPassword.length < 6) {
    throw new HttpError(400, "newPassword must be at least 6 characters");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, "User not found");

  if (!user.passwordHash) {
    // OAuth account setting a password for the first time
    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash: newHash } });
    return res.json({ ok: true });
  }

  if (!currentPassword) {
    throw new HttpError(400, "currentPassword is required");
  }

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw new HttpError(400, "Invalid current password");

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash: newHash } });

  res.json({ ok: true });
};
