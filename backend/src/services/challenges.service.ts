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
        throw new Error("Failed to fetch challenges");
    }

    return data ?? [];
}


export async function createChallenge(supabase: SupabaseClient<Database>,
  userId: string, challenge: Omit<Challenges, "id" | "created_at" | "updated_at" | "user_id">
): Promise<Challenges>{
  const {data, error} = await supabase
  .from("challenges")
  .insert(
    {...challenge, 
    user_id: userId,
    },
)
  .select()
  .single()

  if(error){
    throw new Error("Failed to create new challenge")
  }
  if (!data) {
    throw new Error("Failed to create new challenge");
  }
 

 return data
  
}
