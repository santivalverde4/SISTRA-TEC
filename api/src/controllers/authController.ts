import type { Request, Response } from "express";
import type { User } from "@prisma/client";
import passport from "passport";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import {
  issueTokensForUser,
  loginLocal,
  refreshTokens,
  registerLocal,
  revokeRefreshToken
} from "../services/authService";
import { env } from "../config/env";

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
  passport.authenticate("google", { session: false }, async (err, user) => {
    if (err || !user) {
      res.status(401).json({ error: "OAuth login failed" });
      return;
    }

    try {
      const tokens = await issueTokensForUser(user as User);
      setRefreshCookie(res, tokens.refreshToken);
      res.json({ user: toPublicUser(user as User), accessToken: tokens.accessToken });
    } catch (error) {
      res.status(500).json({ error: "OAuth login failed" });
    }
  })(req, res);
};
