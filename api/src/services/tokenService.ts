import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";
import type { AuthTokenPayload } from "../types/auth";

export type TokenUser = {
  id: string;
  role: Role;
};

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createAccessToken = (user: TokenUser) => {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL
  });
};

export const createRefreshToken = async (userId: string) => {
  const rawToken = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return rawToken;
};

export const rotateRefreshToken = async (rawToken: string) => {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revoked: true }
  });

  const newToken = await createRefreshToken(record.userId);

  return { userId: record.userId, refreshToken: newToken };
};

export const revokeRefreshToken = async (rawToken: string) => {
  const tokenHash = hashToken(rawToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true }
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    if (typeof payload.sub !== "string" || typeof payload.role !== "string") {
      throw new Error("Invalid token payload");
    }

    return { sub: payload.sub, role: payload.role as Role };
  } catch {
    throw new HttpError(401, "Invalid access token");
  }
};
