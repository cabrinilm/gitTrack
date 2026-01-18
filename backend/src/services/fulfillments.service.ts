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
    fulfilledAt: string 
): Fulfillments[] {

const { data, error} = await supabase
.from("active_challenges")
.select("*")
.eq("fulfilled_at", fulfilledAt)




}
