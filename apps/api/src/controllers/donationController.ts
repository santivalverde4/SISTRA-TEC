import { DonationStatus, Role } from "@prisma/client";
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import {
  createDonation as createDonationRecord,
  getDonationById,
  listDonations as listDonationsService,
  updateDonationStatus as updateDonationStatusService
} from "../services/donationService";

const parseStatus = (value: string) => {
  if (!Object.values(DonationStatus).includes(value as DonationStatus)) {
    throw new HttpError(400, "Invalid donation status");
  }
  return value as DonationStatus;
};

export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const { title, description } = req.body ?? {};
  if (!title) {
    throw new HttpError(400, "Title required");
  }
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const donation = await createDonationRecord({
    title,
    description,
    donorId: req.auth.sub
  });

  res.status(201).json(donation);
});

export const getDonation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const donation = await getDonationById(req.params.id);
  if (!donation) {
    throw new HttpError(404, "Donation not found");
  }

  if (req.auth.role === Role.DONOR && donation.donorId !== req.auth.sub) {
    throw new HttpError(403, "Forbidden");
  }

  res.json(donation);
});

export const listDonations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) {
    throw new HttpError(401, "Unauthorized");
  }

  const donations = await listDonationsService({
    role: req.auth.role,
    userId: req.auth.sub
  });

  res.json(donations);
});

export const updateDonationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body ?? {};
  if (!status) {
    throw new HttpError(400, "Status required");
  }

  const parsedStatus = parseStatus(status);
  const donation = await updateDonationStatusService(req.params.id, parsedStatus);

  res.json(donation);
});
