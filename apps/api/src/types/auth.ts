import { Role } from "@prisma/client";

export interface AuthTokenPayload {
  sub: string;
  role: Role;
}
