import type { Request, Response } from "express";
import * as transportersService from "../services/transportersService";

export const listTransporters = async (_req: Request, res: Response) => {
  const transporters = await transportersService.listTransporters();
  res.json(transporters);
};

export const getTransporterById = async (req: Request, res: Response) => {
  const transporter = await transportersService.getTransporterById(req.params.id);
  res.json(transporter);
};

export const getMyTransporter = async (req: Request, res: Response) => {
  const transporter = await transportersService.getTransporterByUserId(req.auth!.sub);
  res.json(transporter);
};

export const updateMyTransporter = async (req: Request, res: Response) => {
  const transporter = await transportersService.updateTransporterByUserId(req.auth!.sub, req.body);
  res.json(transporter);
};

export const createTransporter = async (req: Request, res: Response) => {
  const transporter = await transportersService.createTransporter(req.body);
  res.status(201).json(transporter);
};

export const updateTransporter = async (req: Request, res: Response) => {
  const transporter = await transportersService.updateTransporter(req.params.id, req.body);
  res.json(transporter);
};
