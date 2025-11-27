import request from "supertest";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import app from "../src/server";
import dotenv from "dotenv";
import type { Database } from "../src/types/supabase";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN!;

describe("Profile routes", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;
 const testUsernamePrefix = "test_user_";

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

    if (!user) throw new Error ("Test user not found");
     userId = user.id;
     
     await supabase.from("profiles").delete().like("name", `${testUsernamePrefix}`)
  });

  afterEach(async () => {
    if(!userId) return;

     await supabase
     .from("profiles")
     .delete()
     .eq("user_id", userId)
     .like("name", `${testUsernamePrefix}%`);
     
  });

  describe("CREATE Profile", () => {
    it("should create a profile for the authenticated user", async () => {
      const body  = {
        username: `${testUsernamePrefix}first`,
        full_name: "Test User"
      };

      const res = await makeRequest("post", "/api/profiles", body);

      console.log(res.body)

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id", userId);
      expect(res.body).toHaveProperty("username", `${testUsernamePrefix}first`);

    });
  });















});
