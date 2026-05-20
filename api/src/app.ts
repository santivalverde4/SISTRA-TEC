import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import { configurePassport } from "./config/passport";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import { errorHandler } from "./middlewares/errorHandler";

export const app = express();

configurePassport();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use(errorHandler);
