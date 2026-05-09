import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

const parseIntEnv = (key: string, fallback: string) => {
  const raw = process.env[key] ?? fallback;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid env var: ${key}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseIntEnv("PORT", "4000"),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  FRONTEND_URL: requireEnv("FRONTEND_URL"),
  JWT_ACCESS_SECRET: requireEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_TTL: parseIntEnv("JWT_ACCESS_TTL", "900"),
  JWT_REFRESH_TTL_DAYS: parseIntEnv("JWT_REFRESH_TTL_DAYS", "7"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_CALLBACK_URL: requireEnv("GOOGLE_CALLBACK_URL")
};
