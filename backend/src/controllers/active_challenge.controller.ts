import type { Request, Response } from "express";
import {
  activateChallenge,
  deleteActiveChallenge,
  getActiveChallenge,
} from "../services/active_challenge.service";

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

export const activateMyChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
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

    const result = await activateChallenge(supabase, userId, challengeId);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error activating challenge :", error);
    res.status(500).json({ error: "Failed to update activate challenge" });
  }
};



export const deleteMyActiveChallenge = async (
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

    const deleted = await deleteActiveChallenge(supabase, userId);

    if (!deleted) {
      res.status(404).json({ error: "No active challenge found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error(
      "Error deleting active challenge for user:",
      req.user?.id,
      error
    );
    res.status(500).json({ error: "Failed to delete active challenge" });
  }
};
