import { Router } from "express";
import { Role } from "@prisma/client";
import { authJwt } from "../middlewares/authJwt";
import { requireRoles } from "../middlewares/requireRoles";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createTransporter,
  getMyTransporter,
  getTransporterById,
  listTransporters,
  updateMyTransporter,
  updateTransporter,
} from "../controllers/transportersController";
import { listMyAssignments } from "../controllers/transportAssignmentsController";
import { listMyEvents } from "../controllers/transportEventsController";

const router = Router();

router.get("/", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(listTransporters));
router.get("/me", authJwt, requireRoles(Role.TRANSPORTER), asyncHandler(getMyTransporter));
router.put("/me", authJwt, requireRoles(Role.TRANSPORTER), asyncHandler(updateMyTransporter));
router.get("/me/assignments", authJwt, requireRoles(Role.TRANSPORTER), asyncHandler(listMyAssignments));
router.get("/me/events", authJwt, requireRoles(Role.TRANSPORTER), asyncHandler(listMyEvents));
router.get("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(getTransporterById));
router.post("/", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(createTransporter));
router.put("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(updateTransporter));

export default router;
