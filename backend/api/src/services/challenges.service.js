"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChallenges = getChallenges;
exports.getChallengeById = getChallengeById;
exports.createChallenge = createChallenge;
exports.updateChallenge = updateChallenge;
exports.deleteChallenge = deleteChallenge;
async function getChallenges(supabase, userId) {
    const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", userId);
    if (error) {
        throw new Error("Failed to fetch challenges");
    }
    return data ?? [];
}
async function getChallengeById(supabase, userId, challengeId) {
    const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("user_id", userId)
        .eq("id", challengeId)
        .maybeSingle();
    if (error) {
        throw new Error("Failed to fetch challenge");
    }
    if (!data) {
        throw new Error("Challenge not found or does not belong to you");
    }
    return data;
}
async function createChallenge(supabase, userId, challenge) {
    const { data, error } = await supabase
        .from("challenges")
        .insert({ ...challenge, user_id: userId })
        .select()
        .single();
    if (error || !data) {
        throw new Error("Failed to create new challenge");
    }
    return data;
}
async function updateChallenge(supabase, userId, challengeId, challenge) {
    const { data, error } = await supabase
        .from("challenges")
        .update({ ...challenge, user_id: userId })
        .eq("id", challengeId)
        .eq("user_id", userId)
        .select()
        .single();
    if (error) {
        throw new Error("Failed to update challenge");
    }
    return data;
}
async function deleteChallenge(supabase, userId, challengeId) {
    const { data, error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId)
        .eq("user_id", userId)
        .select()
        .single();
    if (error) {
        console.error("Supabase error deleting challenge:", error);
        throw new Error("Failed to delete challenge");
    }
    if (!data) {
        throw new Error("Challenge not found");
    }
    return data;
}
