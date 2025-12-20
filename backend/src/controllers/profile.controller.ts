import type { Request, Response } from "express";
import { getProfile } from "../services/profile.service";

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

    res.status(200).json(profile);
    return;
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


