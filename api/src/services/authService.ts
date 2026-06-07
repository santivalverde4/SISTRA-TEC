import bcrypt from "bcryptjs";
import type { Profile } from "passport-google-oauth20";
import { Role, type User } from "@prisma/client";
import { prisma } from "../db/prisma";
import { HttpError } from "../utils/httpError";
import {
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken as revokeRefreshTokenRecord
} from "./tokenService";

type RegisterInput = {
  email: string;
  password: string;
  name?: string;
  role?: string;
  vehicle?: string;
  plate?: string;
  phone?: string;
  address?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const normalizeRole = (role?: string): Role => {
  if (!role) return Role.DONOR;
  const candidate = role.toString().trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
  if (Object.values(Role).includes(candidate as Role)) {
    return candidate as Role;
  }
  return Role.DONOR;
};

export const registerLocal = async (input: RegisterInput): Promise<User> => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const role = normalizeRole(input.role);

  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name, role, phone: input.phone, address: input.address }
  });

  if (role === Role.TRANSPORTER) {
    await prisma.transporter.create({
      data: { userId: user.id, vehicle: input.vehicle ?? "", plate: input.plate ?? "", phone: input.phone ?? undefined }
    });
  }

  return user;
};

export const loginLocal = async (input: LoginInput): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, "Invalid credentials");
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new HttpError(401, "Invalid credentials");
  }

  return user;
};

export const issueTokensForUser = async (user: User) => {
  const accessToken = createAccessToken({ id: user.id, role: user.role });
  const refreshToken = await createRefreshToken(user.id);

  return { accessToken, refreshToken };
};

export const refreshTokens = async (refreshToken: string) => {
  const rotation = await rotateRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({
    where: { id: rotation.userId }
  });

  if (!user) {
    throw new HttpError(401, "Invalid refresh token");
  }

  const accessToken = createAccessToken({ id: user.id, role: user.role });

  return { accessToken, refreshToken: rotation.refreshToken };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  await revokeRefreshTokenRecord(refreshToken);
};

export const upsertGoogleUser = async (profile: Profile, role?: string, vehicle?: string, plate?: string, phone?: string, address?: string): Promise<User> => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new HttpError(400, "Google profile missing email");
  }

  const existingAccount = await prisma.oauthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: "google",
        providerUserId: profile.id
      }
    },
    include: { user: true }
  });

  if (existingAccount) {
    if (role) {
      const newRole = normalizeRole(role);
      if (existingAccount.user.role !== newRole) {
        await prisma.user.update({ where: { id: existingAccount.user.id }, data: { role: newRole } });
        existingAccount.user.role = newRole;

        if (newRole === Role.TRANSPORTER) {
          await prisma.transporter.upsert({
            where: { userId: existingAccount.user.id },
            update: {},
            create: { userId: existingAccount.user.id, vehicle: "", plate: "", phone: phone ?? undefined }
          });
        }
      }
    }

    return existingAccount.user;
  }

  const finalRole = role ? normalizeRole(role) : Role.DONOR;

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: profile.displayName || undefined, phone: phone ?? undefined, address: address ?? undefined },
    create: {
      email,
      name: profile.displayName || undefined,
      role: finalRole,
      phone: phone ?? undefined,
      address: address ?? undefined
    }
  });

  await prisma.oauthAccount.create({
    data: {
      provider: "google",
      providerUserId: profile.id,
      userId: user.id
    }
  });

  if (finalRole === Role.TRANSPORTER) {
    await prisma.transporter.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, vehicle: vehicle ?? "", plate: plate ?? "", phone: phone ?? undefined }
    });
  }

  return user;
};
