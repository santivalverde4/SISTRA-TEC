import { Router } from "express";
import { Role } from "@prisma/client";
import { authJwt } from "../middlewares/authJwt";
import { requireRoles } from "../middlewares/requireRoles";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createCampaign,
  deleteCampaign,
  getCampaignById,
  listCampaigns,
  updateCampaign,
  updateCampaignStatus,
} from "../controllers/campaignsController";
import { createOrUpdateCampaignAssignment } from "../controllers/transportAssignmentsController";
import { getTraceabilityByCampaignId } from "../controllers/transportEventsController";

const router = Router();

router.get("/", asyncHandler(listCampaigns));
router.get("/:id", asyncHandler(getCampaignById));
router.post("/", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(createCampaign));
router.put("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(updateCampaign));
router.patch("/:id/status", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(updateCampaignStatus));
router.delete("/:id", authJwt, requireRoles(Role.ADMIN_CENTER), asyncHandler(deleteCampaign));

router.get(
  "/:campaignId/traceability",
  authJwt,
  requireRoles(Role.DONOR, Role.ADMIN_CENTER),
  asyncHandler(getTraceabilityByCampaignId)
);

router.post(
  "/:campaignId/assignment",
  authJwt,
  requireRoles(Role.ADMIN_CENTER),
  asyncHandler(createOrUpdateCampaignAssignment)
);

export default router;
