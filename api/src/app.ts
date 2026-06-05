import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import cookieParser from "cookie-parser";
import { configurePassport } from "./config/passport";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { attachUser } from "./middlewares/attachUser";

import inventoryRoutes from "./routes/inventory.routes";
import donationsRoutes from "./routes/donationsRoutes";
import usersRoutes from "./routes/usersRoutes";
import campaignsRoutes from "./routes/campaignsRoutes";
import transportersRoutes from "./routes/transportersRoutes";
import transportAssignmentsRoutes from "./routes/transportAssignmentsRoutes";
import transportEventsRoutes from "./routes/transportEventsRoutes";

export const app = express();

configurePassport();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(attachUser);

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/donations", donationsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/campaigns", campaignsRoutes);
app.use("/api/transporters", transportersRoutes);
app.use("/api/transport-assignments", transportAssignmentsRoutes);
app.use("/api/transport-events", transportEventsRoutes);

app.use(errorHandler);
