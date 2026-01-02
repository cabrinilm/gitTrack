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
    
    if(error){
        throw new Error(`Failed to fetch challenges: ${error.message}`);
    }

    return data ?? [];
}
