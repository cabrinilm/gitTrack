import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

interface ProfileInput {
  name?: string; // pode ser opcional, já que a tabela tem default
  email: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

class ProfileModel {
  async createProfile(
    supabase: SupabaseClient<Database>,
    user_id: string,
    profile: ProfileInput
  ): Promise<Profile> {
    const { name = "User", email } = profile;

    const { data, error } = await supabase
      .from("profiles")
      .insert([{ id: user_id, name, email }])
      .select()
      .single();

    if (error) {
      if (error.message?.includes("already exists")) {
        throw new Error("Profile with this ID or email already exists");
      }
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    if (!data) {
      throw new Error("No data returned from profile creation");
    }

    return data as Profile;
  }
}

export default new ProfileModel();
