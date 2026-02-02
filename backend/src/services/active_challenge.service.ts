import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
import { Challenges } from "../types/challenges.types";
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
          created_at
        )
      `
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching active challenge:", error);
    throw new Error("Failed to fetch active challenge");
  }

  return data?.challenges ?? null;
}

export async function activateChallenge(
  supabase: SupabaseClient<Database>,
  userId: string,
  challengeId: number
): Promise<Active_Challenge> {
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id, user_id")
    .eq("id", challengeId)
    .single();

  if (challengeError || !challenge) {
    throw new Error("Challenge not found");
  }

  if (challenge.user_id !== userId) {
    throw new Error("Forbidden: cannot activate another user's challenge");
  }
  const { data, error } = await supabase
    .from("active_challenges")
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        activated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Error activating challenge:", error);
    throw new Error("Failed to activate challenge");
  }

  return data;
}

export async function deleteActiveChallenge(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Active_Challenge | null> {
  const { data, error } = await supabase
    .from("active_challenges")
    .delete()
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(
      "Supabase error deactivating active challenge for user:",
      userId,
      error
    );
    throw new Error("Failed to deactivate active challenge");
  }

  if (!data) {
    console.warn("No active challenge found to deactivate for user:", userId);
    return null;
  }

  return data;
}
