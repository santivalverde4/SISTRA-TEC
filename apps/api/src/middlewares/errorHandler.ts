import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/httpError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isHttpError = err instanceof HttpError;
  const statusCode = isHttpError ? err.statusCode : 500;
  const message = isHttpError ? err.message : "Internal server error";

  if (!isHttpError) {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
};
