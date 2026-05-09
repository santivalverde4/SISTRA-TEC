import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createDonation,
  getDonation,
  listDonations,
  updateDonationStatus
} from "../controllers/donationController";
import { authJwt } from "../middlewares/authJwt";
import { requireRoles } from "../middlewares/requireRoles";

export const donationRoutes = Router();

donationRoutes.use(authJwt);
donationRoutes.get("/", listDonations);
donationRoutes.post("/", requireRoles(Role.DONOR), createDonation);
donationRoutes.get("/:id", getDonation);
donationRoutes.patch(
  "/:id/status",
  requireRoles(Role.ADMIN_CENTER, Role.TRANSPORTER),
  updateDonationStatus
);
