import { Database } from "./supabase";
export type Activities = Database["public"]["Tables"]["activities"]["Row"];



export type CreateActivitiesInput = Omit<Activities, "id"| "user_id" | "challenge_id" | "order_num">;

export type UpdateActivitiesInput = Partial<CreateActivitiesInput>;