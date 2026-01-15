import request from "supertest";
import app from "../../src/server";
import { supabase } from "../../src/services/supabaseClient";
import { getActiveChallenge } from "../../src/services/active_challenge.service";

jest.mock("../../src/services/active_challenge.service");
jest.mock("../../src/services/supabaseClient");

describe("Active_challenge", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });
  });

  describe("GET /api/active-challenge", () => {
    it("returns 200 and the user's currently active challenge", async () => {
      const expectedChallenge = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Active challenge",
        description: "Test the output",
        created_at: new Date().toISOString(),
      };

      (getActiveChallenge as jest.Mock).mockResolvedValue(expectedChallenge);

      const response = await request(app)
        .get("/api/active-challenge")
        .set("Authorization", "Bearer any-fake-tokne")
        .expect(200);

      expect(response.body).toEqual(expectedChallenge);
      expect(getActiveChallenge).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId
      );
    });
    it("returns 200 and null when no active challenge exists", async () => {
      (getActiveChallenge as jest.Mock).mockResolvedValue(null);
      const response = await request(app)
        .get("/api/active-challenge")
        .set("Authorization", "Bearer any-fake-tokne")
        .expect(200);

      expect(response.body).toEqual(null);
      expect(getActiveChallenge).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get("/api/active-challenge")
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (getActiveChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch active challenge")
      );

      const response = await request(app)
      .get("/api/active-challenge")
      .set("Authorization", "Bearer any-fake-token")
      .expect(500);

      expect(response.body.error).toBe("Failed to fetch active challenge");
    });
  });
});
