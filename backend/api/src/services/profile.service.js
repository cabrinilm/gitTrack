"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
async function getProfile(supabase, userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
    if (error) {
        throw new Error(`Failed to fetch profile: ${error.message} `);
    }
    return data;
}
async function updateProfile(supabase, userId, updates) {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
    if (error) {
        throw new Error("Failed to update profile");
    }
    if (!data) {
        throw new Error("Profile not found or update failed");
    }
    return data;
}
