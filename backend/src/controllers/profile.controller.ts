import type { Request, Response } from "express";
// import profileModel from "../models/profile.model" 


class ProfilesController {

async createProfile(req: Request, res: Response): Promise<void>{
    try{
        const supabase = req.supabase;
        const user_id = req.user?.id;
        const name = req.body;

        if(!supabase) {
            res.status(500).json({error: "Supabase client not found in request"});
            return 
        }

        if(!user_id){
            res.status(401).json({error : "Unauthorized: No user ID found"});
            return
        }

    }

}



}