import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      supabase?: SupabaseClient<Database>;
    }
  }
}
