"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyChallenge = exports.updateMyChallenge = exports.createMyChallenge = exports.getMyChallengeById = exports.getMyChallenges = void 0;
const challenges_service_1 = require("../services/challenges.service");
const challenge_scheme_1 = require("../schemas/challenge.scheme");
const zod_1 = require("zod");
const getMyChallenges = async (req, res) => {
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
        const challenges = await (0, challenges_service_1.getChallenges)(supabase, userId);
        res.status(200).json(challenges);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch challenges" });
    }
};
exports.getMyChallenges = getMyChallenges;
const getMyChallengeById = async (req, res) => {
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
        const challenge = await (0, challenges_service_1.getChallengeById)(supabase, userId, challengeId);
        res.status(200).json(challenge);
    }
    catch (error) {
        console.error("Error fetching challenge by ID:", error);
        res.status(500).json({ error: "Failed to fetch challenge" });
    }
};
exports.getMyChallengeById = getMyChallengeById;
const createMyChallenge = async (req, res) => {
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
        const parsed = challenge_scheme_1.postChallengeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Invalid request body",
                details: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const normalizedData = {
            ...parsed.data,
            description: parsed.data.description ?? null,
        };
        const newChallenge = await (0, challenges_service_1.createChallenge)(supabase, userId, normalizedData);
        res.status(201).json(newChallenge);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create new challenge" });
    }
};
exports.createMyChallenge = createMyChallenge;
const updateMyChallenge = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        const parsed = challenge_scheme_1.postChallengeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                error: "Invalid request body",
                details: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const normalizedData = {
            ...parsed.data,
            description: parsed.data.description ?? null,
        };
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
        const challengeUpdated = await (0, challenges_service_1.updateChallenge)(supabase, userId, challengeId, normalizedData);
        res.status(200).json(challengeUpdated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update challenge" });
    }
};
exports.updateMyChallenge = updateMyChallenge;
const deleteMyChallenge = async (req, res) => {
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
        const deletedChallenge = await (0, challenges_service_1.deleteChallenge)(supabase, userId, challengeId);
        res.status(200).json(deletedChallenge);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete challenge" });
    }
};
exports.deleteMyChallenge = deleteMyChallenge;
