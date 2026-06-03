import type { RequestHandler, Request } from "express";
import type { AuthTokenPayload } from "../types/auth";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../services/tokenService";

export const authJwt: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    throw new HttpError(401, "Missing authorization header");
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Invalid authorization header");
  }

  const payload = verifyAccessToken(token);
  const r = req as Request & { auth?: AuthTokenPayload };
  r.auth = { sub: payload.sub, role: payload.role };
  next();
};
