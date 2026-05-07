"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getMyProfile = void 0;
const profile_service_1 = require("../services/profile.service");
const profile_schema_1 = require("../schemas/profile.schema");
const zod_1 = require("zod");
const getMyProfile = async (req, res) => {
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
        const profile = await (0, profile_service_1.getProfile)(supabase, userId);
        if (!profile) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }
        res.status(200).json(profile);
        return;
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to fetch profile",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res) => {
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
        const parsed = profile_schema_1.updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Invalid name",
                details: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const profile = await (0, profile_service_1.updateProfile)(supabase, userId, parsed.data);
        res.status(200).json(profile);
    }
    catch (error) {
        if (error instanceof Error && error.message === "Profile not found") {
            res.status(404).json({ error: "Profile not found" });
            return;
        }
        res.status(500).json({ error: "Failed to update profile" });
    }
};
exports.updateMyProfile = updateMyProfile;
