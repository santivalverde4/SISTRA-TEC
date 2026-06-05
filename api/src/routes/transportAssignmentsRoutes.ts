import { Router } from "express";
import { Role } from "@prisma/client";
import { authJwt } from "../middlewares/authJwt";
import { requireRoles } from "../middlewares/requireRoles";
import { asyncHandler } from "../utils/asyncHandler";
import {
  deleteAssignment,
  getAssignmentById,
  listAssignments,
  updateAssignment,
} from "../controllers/transportAssignmentsController";
import {
  createAssignmentEvent,
  deliverAssignment,
  getAssignmentTraceability,
  listAssignmentEvents,
} from "../controllers/transportEventsController";

const router = Router();

router.get("/", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(listAssignments));
router.get("/:id", authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), asyncHandler(getAssignmentById));
router.put("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(updateAssignment));
router.delete("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(deleteAssignment));

router.get("/:id/events", authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), asyncHandler(listAssignmentEvents));
router.post("/:id/events", authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), asyncHandler(createAssignmentEvent));
router.get("/:id/traceability", authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), asyncHandler(getAssignmentTraceability));
router.patch("/:id/deliver", authJwt, requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER), asyncHandler(deliverAssignment));

export default router;
