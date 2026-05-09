import { DonationStatus, Role } from "@prisma/client";
import { prisma } from "../db/prisma";

type ListInput = {
  role: Role;
  userId: string;
};

type CreateInput = {
  title: string;
  description?: string;
  donorId: string;
};

export const createDonation = async (input: CreateInput) => {
  return prisma.donation.create({
    data: {
      title: input.title,
      description: input.description,
      donorId: input.donorId
    }
  });
};

export const getDonationById = async (id: string) => {
  return prisma.donation.findUnique({ where: { id } });
};

export const listDonations = async (input: ListInput) => {
  if (input.role === Role.DONOR) {
    return prisma.donation.findMany({
      where: { donorId: input.userId },
      orderBy: { createdAt: "desc" }
    });
  }

  return prisma.donation.findMany({
    orderBy: { createdAt: "desc" }
  });
};

export const updateDonationStatus = async (
  id: string,
  status: DonationStatus
) => {
  return prisma.donation.update({
    where: { id },
    data: { status }
  });
};
