import type { RequestHandler, Request } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../db/prisma";
import type { AuthTokenPayload } from "../types/auth";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../services/tokenService";

const devUser = {
  id: "dev-user-id",
  sub: "dev-user-id",
  userId: "dev-user-id",
  email: "dev@test.com",
  name: "Dev Test User",
  role: Role.ADMIN_CENTER,
};

export const authJwt: RequestHandler = async (req, _res, next) => {
  if (process.env.BYPASS_AUTH === "true") {
    // DEV ONLY: allows testing protected endpoints from Postman without JWT
    await prisma.user.upsert({
      where: { id: devUser.id },
      update: {
        email: devUser.email,
        name: devUser.name,
        role: devUser.role,
      },
      create: {
        id: devUser.id,
        email: devUser.email,
        name: devUser.name,
        role: devUser.role,
      },
    });
    await prisma.transporter.upsert({
      where: { userId: devUser.id },
      update: {
        vehicle: "Dev Test Truck",
        plate: "DEV-001",
      },
      create: {
        userId: devUser.id,
        vehicle: "Dev Test Truck",
        plate: "DEV-001",
      },
    });

    const r = req as Request & { auth?: AuthTokenPayload };
    r.auth = {
      sub: devUser.sub,
      role: devUser.role,
      userId: devUser.userId,
      email: devUser.email,
      id: devUser.id,
    } as AuthTokenPayload;
    (r as any).user = {
      id: devUser.id,
      email: devUser.email,
      name: devUser.name,
      role: devUser.role,
    };
    next();
    return;
  }

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
