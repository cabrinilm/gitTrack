import type { Request, Response } from "express";
import { getProfile, updateProfile } from "../services/profile.service";
import { updateProfileSchema } from "../schemas/profile.schema";
import { z } from "zod"

export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
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

    const profile = await getProfile(supabase, userId);
      
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(200).json(profile);
    return;
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};



export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;

    if (!supabase) {
      res
        .status(500)
        .json({ error: "Supabase client not found in request" });
      return;
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    
    const parsed = updateProfileSchema.safeParse(req.body);
   
    if (!parsed.success) {
       res.status(400).json({
        error: "Invalid name",
        details: z.treeifyError(parsed.error),
      });
      return
    }

    const profile = await updateProfile(
      supabase,
      userId,
      parsed.data
    );
   
    
   

    res.status(200).json(profile);
    
  } catch (error) {
    if (error instanceof Error && error.message === "Profile not found") {
      res.status(404).json({ error: "Profile not found" });
      return;
    } 
    
    res.status(500).json({ error: "Failed to update profile" });
  }
};
