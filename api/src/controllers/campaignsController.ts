import type { Request, Response } from "express";
import * as campaignsService from "../services/campaignsService";

export const listCampaigns = async (req: Request, res: Response) => {
  const campaigns = await campaignsService.listCampaigns({
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    category: typeof req.query.category === "string" ? req.query.category : undefined,
    requesterId: (req as any).auth?.sub,
  });

  res.json(campaigns);
};

export const getCampaignById = async (req: Request, res: Response) => {
  const campaign = await campaignsService.getCampaignById(req.params.id);
  res.json(campaign);
};

export const createCampaign = async (req: Request, res: Response) => {
  const campaign = await campaignsService.createCampaign({ ...req.body, createdById: (req as any).auth?.sub });
  res.status(201).json(campaign);
};

export const updateCampaign = async (req: Request, res: Response) => {
  const campaign = await campaignsService.updateCampaign(req.params.id, { ...req.body, requesterId: (req as any).auth?.sub });
  res.json(campaign);
};

export const updateCampaignStatus = async (req: Request, res: Response) => {
  const campaign = await campaignsService.updateCampaignStatus(req.params.id, req.body.status);
  res.json(campaign);
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const result = await campaignsService.deleteCampaign(req.params.id);
  res.json(result);
};
