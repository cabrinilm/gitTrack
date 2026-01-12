import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
export type Activities = Database["public"]["Tables"]["activities"]["Row"];

export async function getActivities(
  supabase: SupabaseClient<Database>,
  userId: string,
  challengeId: number
): Promise<Activities[]> {
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

export async function getActivityById(
  supabase: SupabaseClient<Database>,
  userId: string,
  challengeId: number,
  activityId: number
): Promise<Activities> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("id", activityId)
    .single();

    if (error) {
        console.error("Supabase error fetching activity:", error);
        throw new Error("Failed to fetch activity");
      }
    
      if (!data) {
        throw new Error("Activity not found or does not belong to this challenge");
      }
    
      return data;

    }