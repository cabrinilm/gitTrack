import type {Request, Response} from "express";

import { getActivities, getActivityById } from "../services/activities.service";

export const getMyActivities = async (
    req: Request,
    res:Response
): Promise<void> => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id
        const challengeId = Number(req.params.challengeId);
       
        if (!supabase) {
            res.status(500).json({ error: "Supabase client not found in request" });
            return;
          }
      
          if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user ID found" });
            return;
          }
          if (Number.isNaN(challengeId)) {
            res.status(400).json({ error: "Invalid challenge id" });
            return;
          }

          const activities = await getActivities(supabase, userId, challengeId)

          res.status(200).json(activities);
    } catch(error){
        console.error("Error fetching activitie :", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
};

export const getMyActivityById = async (
  req: Request, 
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const challengeId = Number(req.params.challengeId);
    const activityId =   Number(req.params.activityId);
   
  
    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    }
    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    }
    if (Number.isNaN(activityId)) {
      res.status(400).json({ error: "Invalid activity id" });
      return;
    }

    const activity = await getActivityById(supabase, userId, challengeId, activityId)

    res.status(200).json(activity)

  } catch(error){
    console.error("Error fetching activity:", error);
    res.status(500).json({error: "Failed to fetch activity"});
  }
};

