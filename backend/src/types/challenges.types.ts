import { Database } from "./supabase";
export type Challenges = Database["public"]["Tables"]["challenges"]["Row"];


export type CreateChallengeInput = Omit<Challenges, "id" | "user_id" | "created_at"> & {
    description?: string | null;
};

export type UpdateChallengeInput = Partial<CreateChallengeInput>;

