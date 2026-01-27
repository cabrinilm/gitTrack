import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";
// import { Challenges } from "../../src/services/challenges.service";
import { CreateChallengeInput } from "../../src/types/challenges.types";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerTokenUserA = process.env.SUPABASE_BEARER_TOKEN!;
const bearerTokenUserB = process.env.SUPABASE_BEARER_TOKEN_2USER!;

describe("Challenge", () => {
  let supabaseUserA: SupabaseClient<Database>;
  let supabaseUserB: SupabaseClient<Database>;

  let userAId: string;
  let userBId: string;
  const testNamePrefix = "Test Challenge";


const authHeaderUserA = { Authorization: `Bearer ${bearerTokenUserA}` };
const authHeaderUserB = { Authorization: `Bearer ${bearerTokenUserB}` };

  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object,
    headers?: { [key: string]: string } 
  ) => {
    let req = request(app)[method](url).set("Content-Type", "application/json");
    if (headers) req = req.set(headers);
    if (body) req = req.send(body);
    return req;
  };

  beforeAll(async () => {
    if (!bearerTokenUserA || !bearerTokenUserB) {
      throw new Error("Missing bearer tokens");
    }
  
    supabaseUserA = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeaderUserA },
    });

  
    supabaseUserB = createClient(supabaseUrl, supabaseKey, {
      global: { headers: authHeaderUserB },
    });
   
    const { data: userAData } = await supabaseUserA.auth.getUser();
    const { data: userBData } = await supabaseUserB.auth.getUser();
  
    if (!userAData.user || !userBData.user) {
      throw new Error("Users not found");
    }
  
    userAId = userAData.user.id;
    userBId = userBData.user.id;
  });

  afterEach(async () => {
  
      await supabaseUserA
        .from("challenges")
        .delete()
        .eq("user_id", userAId)
        .ilike("name", `${testNamePrefix}%`);
    
      await supabaseUserB
        .from("active_challenges")
        .delete()
        .eq("user_id", userBId);

  });
  describe("POST /api/challenges", () => {
    it("should create challenge and activate it", async () => {
      const body: CreateChallengeInput = {
        name: `${testNamePrefix} - ${Date.now()}`,
        description: "New Challenge",
      };

      const res = await makeRequest("post", "/api/challenges", body, authHeaderUserA).expect(
        201
      );

      expect(res.body).toMatchObject({
        name: body.name,
        description: body.description,
        user_id: userAId,
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.created_at).toBeDefined();

      const activateChallenge = await makeRequest(
        "post",
        `/api/challenges/${res.body.id}/activate`, undefined ,authHeaderUserA
      ).expect(201);

      expect(activateChallenge.body).toMatchObject({
        user_id: userAId,
        challenge_id: res.body.id,
        activated_at: expect.any(String),
      });
    });
    it("should not allow user B to activate user A challenge", async () => {
      const body: CreateChallengeInput = {
        name: `${testNamePrefix} - ${Date.now()}`,
        description: "User A challenge",
      };
    
     
      const challengeRes = await makeRequest(
        "post",
        "/api/challenges",
        body,
        authHeaderUserA
      ).expect(201);
    
      const challengeId = challengeRes.body.id;
    console.log(userAId)
   console.log(userBId)
      await makeRequest(
        "post",
        `/api/challenges/${challengeId}/activate`,
        undefined,
        authHeaderUserB
      ).expect(404);
    });
  });
});
