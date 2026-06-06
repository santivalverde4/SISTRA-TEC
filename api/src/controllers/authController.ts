import type { Request, Response } from "express";
import type { User } from "@prisma/client";
import passport from "passport";
import jwt from "jsonwebtoken";
import type { Profile } from "passport-google-oauth20";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { normalizeRole } from "../services/authService";
import { Role } from "@prisma/client";
import {
  issueTokensForUser,
  loginLocal,
  refreshTokens,
  registerLocal,
  revokeRefreshToken,
  upsertGoogleUser
} from "../services/authService";
import { env } from "../config/env";
import { prisma } from "../db/prisma";

const toPublicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

const setRefreshCookie = (res: Response, token: string) => {
  const isProd = env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body ?? {};
  if (!email || !password) {
    throw new HttpError(400, "Email and password required");
  }

  const user = await registerLocal({ email, password, name, role });
  const tokens = await issueTokensForUser(user);

  setRefreshCookie(res, tokens.refreshToken);

  res.status(201).json({ user: toPublicUser(user), accessToken: tokens.accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    throw new HttpError(400, "Email and password required");
  }

  const user = await loginLocal({ email, password });
  const tokens = await issueTokensForUser(user);

  setRefreshCookie(res, tokens.refreshToken);

  res.json({ user: toPublicUser(user), accessToken: tokens.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token required");
  }

  const tokens = await refreshTokens(refreshToken);

  setRefreshCookie(res, tokens.refreshToken);

  res.json({ accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token required");
  }

  await revokeRefreshToken(refreshToken);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(204).send();
});

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate("google", { session: false }, (err, profile: unknown) => {
    if (err || !profile) {
      res.status(401).json({ error: "OAuth login failed" });
      return;
    }

    try {
      const p = profile as Profile;
      const payload = {
        id: p.id,
        displayName: p.displayName,
        email: p.emails?.[0]?.value
      };

      const tempToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "10m" });

      const redirectUrl = new URL(env.FRONTEND_URL);
      redirectUrl.pathname = "/auth/google/complete";
      redirectUrl.searchParams.set("t", tempToken);

      res.redirect(302, redirectUrl.toString());
    } catch (error) {
      res.status(500).json({ error: "OAuth login failed" });
    }
  })(req, res);
};

export const completeGoogleOnboard = asyncHandler(async (req: Request, res: Response) => {
  const { tempToken, role, vehicle, plate } = req.body ?? {};
  if (!tempToken) {
    throw new HttpError(400, "Temp token required");
  }

  
  const normalizedRole = role ? normalizeRole(role) : undefined;

  let payload: { id: string; displayName?: string; email?: string };
  try {
    payload = jwt.verify(tempToken, env.JWT_ACCESS_SECRET) as typeof payload;
  } catch (error) {
    throw new HttpError(401, "Invalid or expired temp token");
  }

  
  const existingAccount = await prisma.oauthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: "google",
        providerUserId: payload.id
      }
    }
  });

  
  if (!existingAccount && !normalizedRole) {
    throw new HttpError(400, "Role required to complete onboarding for new users");
  }

  
  const profile: Partial<Profile> = {
    id: payload.id,
    displayName: payload.displayName,
    emails: payload.email ? [{ value: payload.email }] as any : undefined
  };

  const user = await upsertGoogleUser(profile as Profile, normalizedRole as unknown as string, vehicle, plate);
  const tokens = await issueTokensForUser(user);

  setRefreshCookie(res, tokens.refreshToken);
  res.json({ user: toPublicUser(user), accessToken: tokens.accessToken });
});
