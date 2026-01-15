import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { Challenges } from "./challenges.service";
export type Active_Challenge =
  Database["public"]["Tables"]["active_challenges"]["Row"];

export async function getActiveChallenge(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Challenges | null> {
  const { data, error } = await supabase
    .from("active_challenges")
    .select(
      `
        challenge_id,
        activated_at,
        challenges (
        user_id,
        id,
        name,
        description,
        created_at)
        `
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching active challenge:", error);
    return null;
  }

  return data?.challenges ?? null;
}
