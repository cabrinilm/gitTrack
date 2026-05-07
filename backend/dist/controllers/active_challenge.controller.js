"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyActiveChallenge = exports.activateMyChallenge = exports.getMyActiveChallenge = void 0;
const active_challenge_service_1 = require("../services/active_challenge.service");
const getMyActiveChallenge = async (req, res) => {
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
        const activeChallenge = await (0, active_challenge_service_1.getActiveChallenge)(supabase, userId);
        res.status(200).json(activeChallenge);
    }
    catch (error) {
        console.error("Error fetching active_challenge:", error);
        res.status(500).json({ error: "Failed to fetch active challenge" });
    }
};
exports.getMyActiveChallenge = getMyActiveChallenge;
const activateMyChallenge = async (req, res) => {
    try {
        const supabase = req.supabase;
        const userId = req.user?.id;
        const challengeId = Number(req.params.challengeId);
        console.log(challengeId);
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
        const result = await (0, active_challenge_service_1.activateChallenge)(supabase, userId, challengeId);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error?.message ?? "";
        if (message.includes("Forbidden")) {
            res.status(403).json({ error: message });
        }
        else if (message.includes("Challenge not found")) {
            res.status(404).json({ error: message });
        }
        else {
            console.error(error);
            res.status(500).json({ error: "Failed to update active challenge" });
        }
    }
};
exports.activateMyChallenge = activateMyChallenge;
const deleteMyActiveChallenge = async (req, res) => {
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
        const deleted = await (0, active_challenge_service_1.deleteActiveChallenge)(supabase, userId);
        if (!deleted) {
            res.status(404).json({ error: "No active challenge found" });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error("Error deleting active challenge for user:", req.user?.id, error);
        res.status(500).json({ error: "Failed to delete active challenge" });
    }
};
exports.deleteMyActiveChallenge = deleteMyActiveChallenge;
