import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import app from "../../src/server";
import dotenv from "dotenv";
import { Database } from "../../src/types/supabase";
import { CreateChallengeInput } from "../../src/types/challenges.types";
import { CreateActivitiesInput } from "../../src/types/activities.types";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerTokenUserA = process.env.SUPABASE_BEARER_TOKEN!;
const bearerTokenUserB = process.env.SUPABASE_BEARER_TOKEN_2USER!;

describe("Fulfillments", () => {
  let supabaseUserA: SupabaseClient<Database>;
  let supabaseUserB: SupabaseClient<Database>;

  let userAId: string;
  let userBId: string;
  let challengeId: number;

  let activityId1: number;
  let activityId2: number;
  let activityId3: number;

  const authHeaderUserA = { Authorization: `Bearer ${bearerTokenUserA}` };
  const authHeaderUserB = { Authorization: `Bearer ${bearerTokenUserB}` };

  const makeRequest = (
    method: "post" | "get" | "patch" | "delete",
    url: string,
    body?: object,
    headers?: { [key: string]: string },
  ) => {
    let req = request(app)[method](url).set("Content-Type", "application/json");
    if (headers) req = req.set(headers);
    if (body) req = req.send(body);
    return req;
  };

  beforeEach(async () => {
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

    const challengeBody: CreateChallengeInput = {
      name: `Test Challenge ${Date.now()}`,
      description: "Test",
    };
    const challengeRes = await makeRequest(
      "post",
      "/api/challenges",
      challengeBody,
      authHeaderUserA,
    );
    challengeId = challengeRes.body.id;

    const newActivity: CreateActivitiesInput = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    const newActivity2: CreateActivitiesInput = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    const newActivity3: CreateActivitiesInput = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    const activityRes1 = await makeRequest(
      "post",
      `/api/challenges/${challengeId}/activities`,
      newActivity,
      authHeaderUserA,
    );
    const activityRes2 = await makeRequest(
      "post",
      `/api/challenges/${challengeId}/activities`,
      newActivity2,
      authHeaderUserA,
    );
    const activityRes3 = await makeRequest(
      "post",
      `/api/challenges/${challengeId}/activities`,
      newActivity3,
      authHeaderUserA,
    );

    activityId1 = activityRes1.body.id;
    activityId2 = activityRes2.body.id;
    activityId3 = activityRes3.body.id;
  });
  afterEach(async () => {

     try {
   
    await supabaseUserA
      .from("daily_activity_fulfillments")
      .delete()
      .in("activity_id", [activityId1, activityId2, activityId3]);


    await supabaseUserA
      .from("progress_entries")
      .delete()
      .eq("user_id", userAId);

     await supabaseUserB
      .from("progress_entries")
      .delete()
      .eq("user_id", userBId);
      
    await supabaseUserA
      .from("activities")
      .delete()
      .eq("challenge_id", challengeId);

   
    await supabaseUserA
      .from("challenges")
      .delete()
      .eq("id", challengeId);

  } catch (err) {
    console.error("Failed to clean up after test:", err);
  }
  });
  describe("POST /api/progress/fulfillments", () => {
    it("should fulfill the marked activities", async () => {
      const body = {
        activityId: activityId1,
      };

      const res = await makeRequest(
        "post",
        "/api/progress/fulfillments",
        body,
        authHeaderUserA,
      ).expect(201);

      expect(res.body.fulfillment).toMatchObject({
        activity_id: activityId1,
        activity_name: "Gym workout",
        planned_duration_minutes: 60,
      });

      expect(res.body.fulfillment.id).toBeDefined();
      expect(res.body.fulfillment.fulfilled_at).toBeDefined();
    });
    it("returns 404 when trying to fulfill an activity outside user scope", async () => {
      const body = {
        activityId: activityId1,
      };

      const res = await makeRequest(
        "post",
        "/api/progress/fulfillments",
        body,
        authHeaderUserB,
      ).expect(404);
    });
  });
  describe("GET /api/progress/fulfillments", () => {
    const today = new Date().toISOString().split("T")[0];

    it("should display fulfilled activities", async () => {
      const body = {
        activityId: activityId1,
      };
      const bodyActivityPost = {
        activityId: activityId2,
      };
      const bodyActivityPost2 = {
        activityId: activityId3,
      };

      const resPostActvity1 = await makeRequest(
        "post",
        "/api/progress/fulfillments",
        body,
        authHeaderUserA,
      ).expect(201);

      const resPostActvity2 = await makeRequest(
        "post",
        "/api/progress/fulfillments",
        bodyActivityPost,
        authHeaderUserA,
      ).expect(201);

      const resPostActvity3 = await makeRequest(
        "post",
        "/api/progress/fulfillments",
        bodyActivityPost2,
        authHeaderUserA,
      ).expect(201);

      const res = await makeRequest(
        "get",
        `/api/progress/${today}/fulfillments`,
        undefined,
        authHeaderUserA,
      ).expect(200);

      expect(res.body.fulfillments).toMatchObject([
        {
          activity_id: activityId1,
          activity_name: "Gym workout",
          planned_duration_minutes: 60,
        },
        {
          activity_id: activityId2,
          activity_name: "Gym workout",
          planned_duration_minutes: 60,
        },
        {
          activity_id: activityId3,
          activity_name: "Gym workout",
          planned_duration_minutes: 60,
        },
      ]);
    });
    it("should return empty array if no activity is fulfilled at the day", async () => {
      const res = await makeRequest(
        "get",
        `/api/progress/${today}/fulfillments`,
        undefined,
        authHeaderUserA,
      ).expect(200);

      expect(res.body.fulfillments).toEqual([]);
    });
  });
});
