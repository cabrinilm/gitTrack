import type { Request, Response } from "express";
import { z } from "zod";
import { getActiveChallenge } from "../services/active_challenge.service";

export const getMyActiveChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const activeChallenge = await getActiveChallenge(supabase, userId);

    res.status(200).json(activeChallenge);
  } catch (error) {
    console.error("Error fetching active_challenge:", error);
    res.status(500).json({ error: "Failed to fetch active challenge" });
  }
};
