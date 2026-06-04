import type { Request, Response } from "express";
import * as transportAssignmentsService from "../services/transportAssignmentsService";

export const listAssignments = async (_req: Request, res: Response) => {
  const assignments = await transportAssignmentsService.listAssignments();
  res.json(assignments);
};

export const getAssignmentById = async (req: Request, res: Response) => {
  const assignment = await transportAssignmentsService.getAssignmentById(
    req.params.id,
    req.auth!.sub,
    req.auth!.role
  );
  res.json(assignment);
};

export const createOrUpdateCampaignAssignment = async (req: Request, res: Response) => {
  const assignment = await transportAssignmentsService.createOrUpdateCampaignAssignment(
    req.params.campaignId,
    req.body
  );
  res.status(201).json(assignment);
};

export const updateAssignment = async (req: Request, res: Response) => {
  const assignment = await transportAssignmentsService.updateAssignment(req.params.id, req.body);
  res.json(assignment);
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const result = await transportAssignmentsService.deleteAssignment(req.params.id);
  res.json(result);
};

export const listMyAssignments = async (req: Request, res: Response) => {
  const assignments = await transportAssignmentsService.listAssignmentsForTransporter(req.auth!.sub);
  res.json(assignments);
};
