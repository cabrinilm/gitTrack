import type { Request, Response } from "express";
import { createChallenge, getChallenges } from "../services/challenges.service";
import { postChallengeSchema } from "../schemas/challenge.scheme";
import { z } from "zod";

export const getMyChallenges = async (
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

    const challenges = await getChallenges(supabase, userId);

    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
};

export const createMyChallenges = async (
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

    const parsed = postChallengeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: z.treeifyError(parsed.error),
      });
      return;
    }
    const normalizedData = {
      ...parsed.data,
      description: parsed.data.description ?? null,
    };

    const newChallenge = await createChallenge(supabase, userId, normalizedData);

    res.status(201).json(newChallenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to create new challenge" });
  }
};
