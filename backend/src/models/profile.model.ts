import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";


interface ProfileInput {
    name: string,
    
}

interface Profile extends ProfileInput {
    user_id: string, 
    created_at: string,
    updated_at: string, 
}


class ProfileModel {
    async createProfile(supabase: SupabaseClient<Database>,
        user_id: string,
        profile: ProfileInput
    ): Promise<Profile> {
        const username = profile; 
        const {data, error} = await supabase
        .from("profiles")
        .insert([{
           username
    }])
    .select()
    .single();

    if (error) {
        if (error.code === "23505") {
          throw new Error("Profile with this username already exists");
        }
        throw new Error(`Failed to create profile: ${error.message}`);
      }
  
      if (!data) {
        throw new Error("No data returned from profile creation");
      }
  
      return data as Profile;
    }
  }