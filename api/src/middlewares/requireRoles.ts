import type { RequestHandler, Request } from "express";
import { Role } from "@prisma/client";
import { HttpError } from "../utils/httpError";
import type { AuthTokenPayload } from "../types/auth";

export const requireRoles = (...roles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (process.env.BYPASS_AUTH === "true") {
      // DEV ONLY: allows testing protected endpoints from Postman without JWT
      next();
      return;
    }

    const r = req as Request & { auth?: AuthTokenPayload };
    if (!r.auth) {
      next(new HttpError(401, "Unauthorized"));
      return;
    }
    if (!roles.includes(r.auth.role)) {
      next(new HttpError(403, "Forbidden"));
      return;
    }
    next();
  };
};
