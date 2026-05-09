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

const toPublicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body ?? {};
  if (!email || !password) {
    throw new HttpError(400, "Email and password required");
  }

  const user = await registerLocal({ email, password, name, role });
  const tokens = await issueTokensForUser(user);

  res.status(201).json({ user: toPublicUser(user), ...tokens });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    throw new HttpError(400, "Email and password required");
  }

  const user = await loginLocal({ email, password });
  const tokens = await issueTokensForUser(user);

  res.json({ user: toPublicUser(user), ...tokens });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token required");
  }

  const tokens = await refreshTokens(refreshToken);
  res.json(tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token required");
  }

  await revokeRefreshToken(refreshToken);
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
      res.json({ user: toPublicUser(user as User), ...tokens });
    } catch (error) {
      res.status(500).json({ error: "OAuth login failed" });
    }
  })(req, res);
};
