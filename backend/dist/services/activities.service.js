"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = getActivities;
exports.getActivityById = getActivityById;
exports.createActivity = createActivity;
exports.updateActivity = updateActivity;
exports.deleteActivity = deleteActivity;
async function getActivities(supabase, userId, challengeId) {
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId);
    if (error) {
        throw new Error("Failed to fetch activities");
    }
    return data ?? [];
}
async function getActivityById(supabase, userId, challengeId, activityId) {
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .eq("id", activityId)
        .single();
    if (error || !data) {
        console.error("Supabase error fetching activity:", error);
        throw new Error("Failed to fetch activity");
    }
    return data;
}
async function createActivity(supabase, userId, challengeId, activity) {
    const { count, error: countError } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challengeId);
    if (countError) {
        console.error("Error counting activities:", countError);
        throw new Error("Failed to create activity");
    }
    const currentCount = count || 0;
    const nextOrder = currentCount + 1;
    if (nextOrder > 4) {
        throw new Error("Maximum of 4 activities per challenge reached");
    }
    const { data, error } = await supabase
        .from("activities")
        .insert({
        ...activity,
        challenge_id: challengeId,
        user_id: userId,
        order_num: nextOrder,
    })
        .select()
        .single();
    if (error || !data) {
        console.error("Supabase error creating activity:", error);
        throw error;
    }
    return data;
}
async function updateActivity(supabase, userId, challengeId, activityId, updates) {
    const { data, error } = await supabase
        .from("activities")
        .update(updates)
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .eq("id", activityId)
        .select()
        .single();
    if (error || !data) {
        throw new Error("Failed to update activity");
    }
    return data;
}
;
async function deleteActivity(supabase, userId, challengeId, activityId) {
    const { data, error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)
        .eq("challenge_id", challengeId)
        .eq("user_id", userId)
        .select()
        .single();
    if (error) {
        console.error("Supabase error deleting activity:", error);
        throw new Error("Failed to delete activity");
    }
    if (!data) {
        console.error(`Activity not found: id=${activityId}, challenge=${challengeId}, user=${userId}`);
        throw new Error("Activity not found or does not belong to you");
    }
    return data;
}
