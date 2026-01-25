import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import  app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";
import { Challenges } from "../../src/services/challenges.service";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;


describe("Challenge", () => {

    let supabase: SupabaseClient<Database>;
    let userId: string;
    const testTitlePrefix = "test_event_";
  
    const authHeader = { Authorization: `Bearer ${bearerToken}` };
  
    const makeRequest = (
      method: "post" | "get" | "patch" | "delete",
      url: string,
      body?: object,
      headers: { [key: string]: string } = authHeader
    ) => {
      let req = request(app)[method](url).set("Content-Type", "application/json");
      if (headers) req = req.set(headers);
      if (body) req = req.send(body);
      return req;
    };
  
    beforeAll(async () => {
      if (!bearerToken) throw new Error("Missing SUPABASE_BEARER_TOKEN");
  
      supabase = createClient<Database>(supabaseUrl, supabaseKey, {
        global: { headers: authHeader },
      });
  
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (!user) throw new Error("Test user not found");
      userId = user.id;
  
   
    });
  
    afterEach(async () => {
      if (!userId) return;
  
      await supabase
        .from("challenges")
        .delete()
        .eq("user_id", userId)
        .eq("id", challengeId)
        .like("title", `${testTitlePrefix}%`);
    });
  describe("POST /api/challenges",  () => {
    it("should create challenge and active as used challenge", async () => {
      const body: Challenges ={
        
      }
    })
  })

})