import type { Request, Response } from "express";
import { getProfile } from "../services/profile.service";



export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try{
        const supabase = req.supabase;
        const user_id = req.user?.id;
      
        if(!supabase) {
            res.status(500).json({error: "Supabase client not found in request"});
            return 
        }

        if(!user_id){
            res.status(401).json({error : "Unauthorized: No user ID found"});
            return
        }

      

        const profile = await getProfile(supabase, user_id);

        res.status(201).json(profile);
    } catch (error) {
        if( error instanceof Error && error.message.includes("already exists")) {
            res.status(409).json({error: error.message})
            return;
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }

}



