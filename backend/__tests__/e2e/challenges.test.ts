import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import  app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";
// import { Challenges } from "../../src/services/challenges.service";
import { CreateChallengeInput } from "../../src/types/challenges.types";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN;


describe("Challenge", () => {

    let supabase: SupabaseClient<Database>;
    let userId: string;
    const testNamePrefix = "Test Challenge";

  
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

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) throw new Error("Test user not found or error: " + error?.message);
    userId = user.id;
    });
  
    afterEach(async () => {
      if (!userId) return;
  
      // await supabase
      //   .from("challenges")
      //   .delete()
      //   .eq("user_id", userId)
      //   .ilike("name", `${testNamePrefix}%`);
    });
  describe("POST /api/challenges",  () => {
    it("should create challenge and activate it", async () => {
      const body: CreateChallengeInput = {
        name: `${testNamePrefix} - ${Date.now()}`, 
        description: "New Challenge",
      };

      const res = await makeRequest("post", "/api/challenges", body).expect(201);

      expect(res.body).toMatchObject({
        name: body.name,
        description: body.description,
        user_id: userId,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.created_at).toBeDefined();
      console.log(res.body.id);
    //   const { data: active } = await supabase
    //   .from("active_challenges")
    //   .select("*")
    //   .eq("user_id", userId)
    //   .single();
    // console.log(res.body.id)
    // expect(active?.challenge_id).toBe(res.body.id);
//     const activeRes = await makeRequest("get", "/api/active-challenge");
// expect(activeRes.status).toBe(200);
// expect(activeRes.body.activeChallenge.id).toBe(res.body.id);
   
    });
  });

});