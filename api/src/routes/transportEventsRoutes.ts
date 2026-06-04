import { Router } from "express";
import { Role } from "@prisma/client";
import { authJwt } from "../middlewares/authJwt";
import { requireRoles } from "../middlewares/requireRoles";
import { asyncHandler } from "../utils/asyncHandler";
import { listMyEvents } from "../controllers/transportEventsController";

const router = Router();

router.get("/me", authJwt, requireRoles(Role.TRANSPORTER), asyncHandler(listMyEvents));

export default router;
