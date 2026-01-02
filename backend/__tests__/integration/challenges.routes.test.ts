import request from "supertest";
import app from "../../src/server";
import { getChallenges } from "../../src/services/challenges.service";
import { supabase } from "../../src/services/supabaseClient";

jest.mock("../../src/services/challenges.service");
jest.mock("../../src/services/supabaseClient");

describe("GET /api/challenges", () => {
  it("should return 200 and all challenges created by the user", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const listChallenges = [
      {
        user_id: fakeUserId,
        name: "Basic goals",
        description: "I want to learn 3 new activities",
        created_at: new Date().toISOString(),
      },
      {
        user_id: fakeUserId,
        name: "Basic goals",
        description: "I want to start 3 new activities",
        created_at: new Date().toISOString(),
      },
    ];

    (getChallenges as jest.Mock).mockResolvedValue(listChallenges);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .get("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .expect(200);

    expect(response.body).toEqual(listChallenges);
    expect(getChallenges).toHaveBeenCalledWith(expect.any(Object), fakeUserId);
  });
});
