import type { Request, Response } from "express";
import * as transportEventsService from "../services/transportEventsService";

export const listAssignmentEvents = async (req: Request, res: Response) => {
  const events = await transportEventsService.listAssignmentEvents(
    req.params.id,
    req.auth!.sub,
    req.auth!.role
  );
  res.json(events);
};

export const createAssignmentEvent = async (req: Request, res: Response) => {
  const event = await transportEventsService.createAssignmentEvent(
    req.params.id,
    req.auth!.sub,
    req.auth!.role,
    req.body
  );
  res.status(201).json(event);
};

export const listMyEvents = async (req: Request, res: Response) => {
  const events = await transportEventsService.listEventsForTransporter(req.auth!.sub);
  res.json(events);
};

export const getAssignmentTraceability = async (req: Request, res: Response) => {
  const traceability = await transportEventsService.getAssignmentTraceability(
    req.params.id,
    req.auth!.sub,
    req.auth!.role
  );
  res.json(traceability);
};

export const getTraceabilityByCampaignId = async (req: Request, res: Response) => {
  const traceability = await transportEventsService.getTraceabilityByCampaignId(req.params.campaignId);
  res.json(traceability);
};

export const deliverAssignment = async (req: Request, res: Response) => {
  const assignment = await transportEventsService.deliverAssignment(
    req.params.id,
    req.auth!.sub,
    req.auth!.role
  );
  res.json(assignment);
};
