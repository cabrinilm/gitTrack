import { Database } from "./supabase";
export type Fulfillments = Database["public"]["Tables"]["daily_activity_fulfillments"]["Row"];


export type FulfillActivityInput = {
  activityId: number;
};