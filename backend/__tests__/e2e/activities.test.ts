import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import  app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;