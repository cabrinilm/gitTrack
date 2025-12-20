import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
    supabase?: SupabaseClient<Database>;
  }
}

export {};