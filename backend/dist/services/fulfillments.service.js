"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postFulfillActivity = postFulfillActivity;
exports.getFulfillmentsByDate = getFulfillmentsByDate;
exports.getHeatmapData = getHeatmapData;
exports.calculateStreakFromDates = calculateStreakFromDates;
exports.getUserStreak = getUserStreak;
const NotFoundError_1 = require("../errors/NotFoundError");
async function postFulfillActivity(supabase, userId, activityId) {
    const today = new Date().toISOString().split("T")[0];
    const { data: progressEntryId, error: entryError } = await supabase.rpc("get_or_create_progress_entry", {
        p_user_id: userId,
        p_today: today,
    });
    if (entryError || !progressEntryId) {
        console.error("Failed to get/create progress entry:", entryError);
        throw new Error("Failed to prepare progress entry for today");
    }
    const progressEntryNum = Number(progressEntryId);
    if (isNaN(progressEntryNum)) {
        throw new Error("Invalid progress entry ID returned from RPC");
    }
    const { data: activity, error: activityError } = await supabase
        .from("activities")
        .select("name, duration_minutes")
        .eq("id", activityId)
        .eq("user_id", userId)
        .single();
    if (activityError?.code === "PGRST116" || !activity) {
        throw new NotFoundError_1.NotFoundError("Activity not found");
    }
    if (activityError) {
        throw activityError;
    }
    const { data: fulfillment, error: fulfillError } = await supabase
        .from("daily_activity_fulfillments")
        .insert({
        progress_entry_id: progressEntryNum,
        activity_id: activityId,
        activity_name: activity.name,
        planned_duration_minutes: activity.duration_minutes,
        fulfilled_at: new Date().toISOString(),
    })
        .select()
        .single();
    if (fulfillError) {
        if (fulfillError.code === "23505") {
            throw new Error("Already marked");
        }
        console.error("Failed to insert fulfillment:", fulfillError);
        throw new Error("Failed to mark activity as fulfilled");
    }
    return {
        success: true,
        fulfillment,
        progressEntryId,
    };
}
async function getFulfillmentsByDate(supabase, userId, date) {
    const { data: progressEntry, error: entryError } = await supabase
        .from("progress_entries")
        .select("id")
        .eq("user_id", userId)
        .eq("entry_date", date)
        .maybeSingle();
    if (entryError) {
        throw new Error("Failed to fetch progress entry");
    }
    if (!progressEntry) {
        return [];
    }
    const progressEntryId = progressEntry.id;
    const { data: fulfillments, error: fulfillError } = await supabase
        .from("daily_activity_fulfillments")
        .select("*")
        .eq("progress_entry_id", progressEntryId)
        .order("fulfilled_at", { ascending: true });
    if (fulfillError) {
        console.error("Error fetching fulfillments:", fulfillError);
        throw new Error("Failed to fetch fulfillments for the date");
    }
    return fulfillments ?? [];
}
async function getHeatmapData(supabase, userId, year) {
    const selectedYear = year ?? new Date().getFullYear();
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear, 11, 31);
    const { data, error } = await supabase.rpc("get_heatmap_data", {
        p_user_id: userId,
        p_start_date: startOfYear.toISOString().split("T")[0],
        p_end_date: endOfYear.toISOString().split("T")[0],
    });
    if (error) {
        console.error("RPC error fetching heatmap data:", error);
        throw new Error("Failed to fetch heatmap data");
    }
    const heatmapData = data || [];
    function generateFullYear(year, existingData) {
        const map = new Map(existingData.map((d) => [d.date, d.count]));
        const result = [];
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        const daysInYear = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < daysInYear; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = d.toISOString().split("T")[0];
            result.push({
                date: dateStr,
                count: map.get(dateStr) || 0,
            });
        }
        return result;
    }
    return generateFullYear(selectedYear, heatmapData);
}
;
function formatDateKey(date) {
    return date.toISOString().split("T")[0];
}
function getPreviousDateKey(dateKey) {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return formatDateKey(date);
}
function calculateStreakFromDates(dateKeys) {
    const todayKey = formatDateKey(new Date());
    const uniqueDates = new Set(dateKeys);
    const completedToday = uniqueDates.has(todayKey);
    const startDate = completedToday
        ? todayKey
        : getPreviousDateKey(todayKey);
    if (!uniqueDates.has(startDate)) {
        return {
            streak: 0,
            completedToday,
        };
    }
    let streak = 0;
    let currentDate = startDate;
    while (uniqueDates.has(currentDate)) {
        streak++;
        currentDate = getPreviousDateKey(currentDate);
    }
    return {
        streak,
        completedToday,
    };
}
async function getUserStreak(supabase, userId) {
    const { data: progressEntries, error: progressEntriesError } = await supabase
        .from("progress_entries")
        .select("id, entry_date")
        .eq("user_id", userId);
    if (progressEntriesError) {
        console.error("Error fetching progress entries for streak:", progressEntriesError);
        throw new Error("Failed to fetch streak");
    }
    if (!progressEntries || progressEntries.length === 0) {
        return calculateStreakFromDates([]);
    }
    const progressEntryIds = progressEntries.map((entry) => entry.id);
    const { data: fulfillments, error: fulfillmentsError } = await supabase
        .from("daily_activity_fulfillments")
        .select("progress_entry_id")
        .in("progress_entry_id", progressEntryIds);
    if (fulfillmentsError) {
        console.error("Error fetching fulfillments for streak:", fulfillmentsError);
        throw new Error("Failed to fetch streak");
    }
    const fulfilledEntryIds = new Set((fulfillments ?? []).map((fulfillment) => fulfillment.progress_entry_id));
    const dateKeys = progressEntries
        .filter((entry) => fulfilledEntryIds.has(entry.id))
        .map((entry) => entry.entry_date);
    return calculateStreakFromDates(dateKeys);
}
