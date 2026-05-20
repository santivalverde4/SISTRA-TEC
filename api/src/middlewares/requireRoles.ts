import type { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { HttpError } from "../utils/httpError";

export const requireRoles = (...roles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.auth) {
      throw new HttpError(401, "Unauthorized");
    }
    if (!roles.includes(req.auth.role)) {
      throw new HttpError(403, "Forbidden");
    }
    next();
  };
};
