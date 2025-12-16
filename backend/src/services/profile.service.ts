import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export async function getProfile(
    supabase: SupabaseClient<Database>,
    userId: string
  ): Promise<Profile> {
    const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

    if (error) {
        throw new Error(`Failed to fetch profile: ${error.message} `)
    }

    return data
  
  }