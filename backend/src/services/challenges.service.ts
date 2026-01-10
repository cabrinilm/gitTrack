import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
export type Challenges = Database["public"]["Tables"]["challenges"]["Row"];

export async function getChallenges(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Challenges[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error("Failed to fetch challenges");
  }

  return data ?? [];
}

export async function getChallengeById(supabase:SupabaseClient<Database>,
  userId: string,
  challengeId: number
): Promise<Challenges>{

  const {data, error} = await supabase
  .from("challenges")
  .select("*")
  .eq("user_id", userId)
  .eq("challenge_id", challengeId)
  .single();

  if(error){
    throw new Error("Failed to fetch challenge")
  }

  if(!data){
    throw new Error("Challenge does not exist")
  }

  return data;
  
}

export async function createChallenge(
  supabase: SupabaseClient<Database>,
  userId: string,
  challenge: Omit<Challenges, "id" | "created_at" | "updated_at" | "user_id">
): Promise<Challenges> {
  const { data, error } = await supabase
    .from("challenges")
    .insert({ ...challenge, user_id: userId })
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create new challenge");
  }
  if (!data) {
    throw new Error("Failed to create new challenge");
  }

  return data;
}

export async function updateChallenge(
  supabase: SupabaseClient<Database>,
  userId: string,
  challengeId: number,
  challenge: Omit<Challenges, "created_at" | "updated_at" | "user_id" | "id">
): Promise<Challenges> {
  const { data, error } = await supabase
    .from("challenges")
    .update({...challenge, user_id: userId})
    .eq("id", challengeId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update challenge");
  }
  return data;
}

export async function deleteChallenge(
  supabase: SupabaseClient<Database>,
  userId: string,
  challengeId: number
): Promise<Challenges> {
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