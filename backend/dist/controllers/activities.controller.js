"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyActivity = exports.updateMyActivity = exports.createMyActivity = exports.getMyActivityById = exports.getMyActivities = void 0;
const zod_1 = require("zod");
const activities_service_1 = require("../services/activities.service");
const activity_schema_1 = require("../schemas/activity.schema");
const getMyActivities = async (req, res) => {
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
        const activities = await (0, activities_service_1.getActivities)(supabase, userId, challengeId);
        res.status(200).json(activities);
    }
    catch (error) {
        console.error("Error fetching activitie :", error);
        res.status(500).json({ error: "Failed to fetch activities" });
    }
};
exports.getMyActivities = getMyActivities;
const getMyActivityById = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        const activityId = Number(req.params.activityId);
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
        if (Number.isNaN(activityId)) {
            res.status(400).json({ error: "Invalid activity id" });
            return;
        }
        const activity = await (0, activities_service_1.getActivityById)(supabase, userId, challengeId, activityId);
        res.status(200).json(activity);
    }
    catch (error) {
        console.error("Error fetching activity:", error);
        res.status(500).json({ error: "Failed to fetch activity" });
    }
};
exports.getMyActivityById = getMyActivityById;
const createMyActivity = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        const parsed = activity_schema_1.createActivitySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Invalid request body",
                details: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
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
        const createdActivity = await (0, activities_service_1.createActivity)(supabase, userId, challengeId, parsed.data);
        res.status(201).json(createdActivity);
    }
    catch (error) {
        console.error("Error creating activity:", error);
        if (error?.code === "42501" ||
            error?.message?.includes("permission denied")) {
            res.status(403).json({
                error: "You do not have permission to create activities in this challenge",
            });
            return;
        }
        res.status(500).json({ error: "Failed to create new activity" });
    }
};
exports.createMyActivity = createMyActivity;
const updateMyActivity = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        const activityId = Number(req.params.activityId);
        const parsed = activity_schema_1.createActivitySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Invalid request body",
                details: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
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
        if (Number.isNaN(activityId)) {
            res.status(400).json({ error: "Invalid activity id" });
            return;
        }
        const updatedActivity = await (0, activities_service_1.updateActivity)(supabase, userId, challengeId, activityId, parsed.data);
        res.status(200).json(updatedActivity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update activity" });
    }
};
exports.updateMyActivity = updateMyActivity;
const deleteMyActivity = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        const activityId = Number(req.params.activityId);
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
        if (Number.isNaN(activityId)) {
            res.status(400).json({ error: "Invalid activity id" });
            return;
        }
        const deletedActivity = await (0, activities_service_1.deleteActivity)(supabase, userId, challengeId, activityId);
        res.status(200).json(deletedActivity);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete activity" });
    }
};
exports.deleteMyActivity = deleteMyActivity;
