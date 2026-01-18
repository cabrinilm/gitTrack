import type {Request, Response} from "express";
import { postFulfillActivity } from "../services/fulfillments.service";



export const postMyFulfillActivity = async (
    req: Request,
    res: Response
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
      res.status(500).json({
      error : "Failed to fulfill activity",
      });
    }
  };