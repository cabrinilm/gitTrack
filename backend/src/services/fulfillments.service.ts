import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
export type Fulfillments =
  Database["public"]["Tables"]["daily_activity_fulfillments"]["Row"];

export type HeatmapDay = {
  date: string;
  count: number;
};

export async function postFulfillActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
  activityId: number
) {
  const today = new Date().toISOString().split("T")[0];

  const { data: progressEntryId, error: entryError } = await supabase.rpc(
    "get_or_create_progress_entry",
    {
      p_user_id: userId,
      p_today: today,
    }
  );

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

  if (activityError || !activity) {
    throw new Error("Activity not found or does not belong to you");
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
      throw new Error("Essa atividade já foi marcada hoje");
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

export async function getFulfillmentsByDate(
  supabase: SupabaseClient<Database>,
  userId: string,
  date: string
): Promise<Fulfillments[]> {
  const { data: progressEntry, error: entryError } = await supabase
    .from("progress_entries")
    .select("id")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .single();

  if (entryError) {
    console.error("Error fetching progress entry:", entryError);
    throw new Error("Failed to fetch progress entry for the date");
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

export async function getHeatmapData(
  supabase: SupabaseClient<Database>,
  userId: string,
  year?: number
): Promise<HeatmapDay[]> {
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

  function generateFullYear(
    year: number,
    existingData: { date: string; count: number }[]
  ): HeatmapDay[] {
    const map = new Map(existingData.map((d) => [d.date, d.count]));

    const result: HeatmapDay[] = [];

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const daysInYear = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (let i = 0; i < daysInYear; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      result.push({
        date: dateStr,
        count: map.get(dateStr) || 0,
      });
    };

    return result;
  };


  return generateFullYear(selectedYear, heatmapData);
};
