import type { Request, Response } from "express";
import {
  getFulfillmentsByDate,
  getHeatmapData,
  postFulfillActivity,
} from "../services/fulfillments.service";
import { AppError } from "../errors/AppError";

export const postMyFulfillActivity = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const activityId = Number(req.body.activityId);

    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!Number.isInteger(activityId) || activityId <= 0) {
      res.status(400).json({ error: "activityId must be a positive integer" });
      return;
    }

    const fulfill = await postFulfillActivity(supabase, userId, activityId);

    res.status(201).json(fulfill);
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Failed to fulfill activity" });
  }
};

export const getMyFulfillActivitiesByDate = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const date = req.params.date;
  
    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    }

    if (!date) {
      res.status(400).json({ error: "Date is required (YYYY-MM-DD)" });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      return;
    }

    const result = await getFulfillmentsByDate(supabase, userId, date);

    res.status(200).json({ fulfillments: result });
  } catch(error){
     console.error(error);
  res.status(500).json({
    error: "Failed to fetch fulfillments for the date",
  });
  }
};

export const getMyHeatMapData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const year = req.query.year ? Number(req.query.year) : undefined;
    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (year !== undefined && Number.isNaN(year)) {
      res.status(400).json({ error: "Invalid year" });
      return;
    }

    const result = await getHeatmapData(supabase, userId, year);

    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: "Failed to load the heat map" });
  }
};
