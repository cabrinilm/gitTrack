import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
export type Fulfillments = Database["public"]["Tables"]["daily_activity_fulfillments"]["Row"];
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
};

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
      .single()
  
    if (entryError) {
      console.error("Error fetching progress entry:", entryError);
      throw new Error("Failed to fetch progress entry for the date");
    };
  
    if (!progressEntry) {
      return [];
    };
  
    const progressEntryId = progressEntry.id;
  
   
    const { data: fulfillments, error: fulfillError } = await supabase
      .from("daily_activity_fulfillments")
      .select("*")
      .eq("progress_entry_id", progressEntryId)
      .order("fulfilled_at", { ascending: true });
  
    if (fulfillError) {
      console.error("Error fetching fulfillments:", fulfillError);
      throw new Error("Failed to fetch fulfillments for the date");
    };
  
    return fulfillments ?? [];
  };