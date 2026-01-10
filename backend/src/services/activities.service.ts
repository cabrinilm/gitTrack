import type { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";
export type Activities = Database["public"]["Tables"]["activities"]["Row"];


export async function getActivities (
    supabase: SupabaseClient<Database>,
    user_id: string,
    challenge_id: number
): Promise<Activities[]> {
    const {data, error} = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user_id)
    .eq("challenge_id", challenge_id);

    if(error){
        throw new Error("Failed to fetch activities");
    }
    return data ?? [];
}