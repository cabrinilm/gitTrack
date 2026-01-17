import type {Request, Response} from "express";
import { postFulfillActivity } from "../services/fulfillments.service";



export const postMyFulfillActivity = async (
    req: Request,
    res: Response
): Promise<void> => {

    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const activityId = Number(req.params.activityId);



    if (!supabase) {
        res.status(500).json({ error: "Supabase client not found in request" });
        return;
      }
  
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: No user ID found" });
        return;
      }
  
      if (Number.isNaN(activityId)) {
        res.status(400).json({ error: "Invalid challenge id" });
        return;
      }

      const createFulfill = await postFulfillActivity(supabase, userId, activityId);

      res.status(200).json(createFulfill);
    } catch (error){
        res.status(500).json({error: "Failed to fulfill activity"})
    }



}