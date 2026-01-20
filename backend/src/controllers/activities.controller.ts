import type { Request, Response } from "express";
import { z } from "zod";
import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivityById,
  updateActivity,
} from "../services/activities.service";
import { createActivitySchema } from "../schemas/activity.schema";

export const getMyActivities = async (
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
    };

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    };
    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    };

    const activities = await getActivities(supabase, userId, challengeId);

    res.status(200).json(activities);
  } catch (error) {
    console.error("Error fetching activitie :", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  };
};

export const getMyActivityById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const challengeId = Number(req.params.challengeId);
    const activityId = Number(req.params.activityId);

    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    };

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    };
    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    };
    if (Number.isNaN(activityId)) {
      res.status(400).json({ error: "Invalid activity id" });
      return;
    };

    const activity = await getActivityById(
      supabase,
      userId,
      challengeId,
      activityId
    );

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch activity" });
  };
};

export const createMyActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const challengeId = Number(req.params.challengeId);

    const parsed = createActivitySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: z.treeifyError(parsed.error),
      });
      return;
    };

    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    };

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    };

    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    };

    const createdActivity = await createActivity(
      supabase,
      userId,
      challengeId,
      parsed.data
    );

    res.status(201).json(createdActivity);
  } catch (error: any) {
    console.error("Error creating activity:", error);

    if (
      error?.code === "42501" ||
      error?.message?.includes("permission denied")
    ) {
      res.status(403).json({
        error:
          "You do not have permission to create activities in this challenge",
      });
      return;
    };

    res.status(500).json({ error: "Failed to create new activity" });
  };
};

export const updateMyActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const challengeId = Number(req.params.challengeId);
    const activityId = Number(req.params.activityId);

    const parsed = createActivitySchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid request body",
        details: z.treeifyError(parsed.error),
      });
      return;
    };

    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    };

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    };

    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    };

    if (Number.isNaN(activityId)) {
      res.status(400).json({ error: "Invalid activity id" });
      return;
    };

    const updatedActivity = await updateActivity(
      supabase,
      userId,
      challengeId,
      activityId,
      parsed.data
    );

    res.status(200).json(updatedActivity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update activity" });
  };
};


export const deleteMyActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supabase = req.supabase;
    const userId = req.user?.id;
    const challengeId = Number(req.params.challengeId);
    const activityId = Number(req.params.activityId);
    
    if (!supabase) {
      res.status(500).json({ error: "Supabase client not found in request" });
      return;
    };

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: No user ID found" });
      return;
    };
    if (Number.isNaN(challengeId)) {
      res.status(400).json({ error: "Invalid challenge id" });
      return;
    };

    if (Number.isNaN(activityId)) {
      res.status(400).json({ error: "Invalid activity id" });
      return;
    };

    const deletedActivity = await deleteActivity(
      supabase,
      userId,
      challengeId,
      activityId
    );

    res.status(200).json(deletedActivity);
  } catch (error) {
    res.status(500).json({ error: "Failed to delete activity" });
  };
};

