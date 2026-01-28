import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";
import { CreateActivitiesInput } from "../../src/types/activities.types";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerTokenUserA = process.env.SUPABASE_BEARER_TOKEN!;
const bearerTokenUserB = process.env.SUPABASE_BEARER_TOKEN_2USER!;

describe("Activities", () => {
  let supabaseUserA: SupabaseClient<Database>;
  let supabaseUserB: SupabaseClient<Database>;

  let userAId: string;
  let userBId: string;
  let challengeId: number;
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
    console.log("DB user:", userAData);
    console.log("DB user:", userBData);

    if (!userAData.user || !userBData.user) {
      throw new Error("Users not found");
    }

    userAId = userAData.user.id;
    userBId = userBData.user.id;
    const challengeBody = {
      name: `Test Challenge ${Date.now()}`,
      description: "Test",
    };
    const challengeRes = await makeRequest(
      "post",
      "/api/challenges",
      challengeBody,
      authHeaderUserA
    );
    challengeId = challengeRes.body.id;
  });
  afterEach(async () => {
    // await supabaseUserA
    //   .from("activities")
    //   .delete()
    //   .eq("challenge_id", challengeId);
    // await supabaseUserA.from("challenges").delete().eq("id", challengeId);
  });

  describe("POST /api/challenges/:challengeId/activities", () => {
    const body: CreateActivitiesInput = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    it("should create activities in the specified challengeId", async () => {
      const res = await makeRequest(
        "post",
        `/api/challenges/${challengeId}/activities`,
        body,
        authHeaderUserA
      ).expect(201);

      expect(res.body).toMatchObject({
        id: res.body.id,
        challenge_id: challengeId,
        name: body.name,
        duration_minutes: body.duration_minutes,
        order_num: res.body.order_num,
      });
    });
    it.only("should not allow user create activity with another users challengeId", async () => {
      const res = await makeRequest(
        "post",
        `/api/challenges/${challengeId}/activities`,
        body,
        authHeaderUserB
      ).expect(403);
    });
  });
});
