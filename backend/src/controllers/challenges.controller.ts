import type {Request, Response} from "express";
import { getChallenges } from "../services/challenges.service";


export const getMyChallenges = async ( req: Request, res: Response): Promise<void> => {

    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
       


        if (!supabase) {
            res.status(500).json({ error: "Supabase client not found in request" });
            return;
          }
      
          if (!userId) {
            res.status(401).json({ error: "Unauthorized: No user ID found" });
            return;
          }
      
          const challenges = await getChallenges(supabase, userId)

        res.status(200).json(challenges)
        return;
    } catch(error){
        res.status(500).json({error})
    }



}