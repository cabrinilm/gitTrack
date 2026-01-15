import request from "supertest";
import app from "../../src/server";
import { supabase } from "../../src/services/supabaseClient";
import {
  activateChallenge,
  Active_Challenge,
  deleteActiveChallenge,
  getActiveChallenge,
} from "../../src/services/active_challenge.service";

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
  describe("POST /api/challenges/:challengeId/activate", () => {
    it("returns 201 and the activated challenge", async () => {
      const activeChallenge: Active_Challenge = {
        user_id: fakeUserId,
        challenge_id: fakeChallengeId,
        activated_at: new Date().toISOString(),
      };

      (activateChallenge as jest.Mock).mockResolvedValue(activeChallenge);

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activate`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(201);

      expect(response.body).toEqual(activeChallenge);

      expect(activateChallenge).toHaveBeenCalledWith(
        expect.anything(),
        fakeUserId,
        fakeChallengeId
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activate`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 if challenge id is no provided", async () => {
      const response = await request(app)
        .patch(`/api/challenges/activate`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);
    });

    it("returns 404 if activity id is invalid", async () => {
      const response = await request(app)
        .patch(`/api/challenges/abc/activate`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(404);
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (activateChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to delete activity")
      );

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activate`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to update activate challenge");
    });
  });
  describe("DELETE /api/activate-challenge", () => {
    it("returns 204 when the active challenge is deleted", async () => {
      (deleteActiveChallenge as jest.Mock).mockResolvedValue({
        user_id: fakeUserId,
        challenge_id: fakeChallengeId,
        activated_at: new Date().toISOString(),
      });

      await request(app)
        .delete("/api/activate-challenge")
        .set("Authorization", "Bearer any-fake-token")
        .expect(204);

      expect(deleteActiveChallenge).toHaveBeenCalledTimes(1);
      expect(deleteActiveChallenge).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .post("/api/activate-challenge")
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (deleteActiveChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to delete active challenge")
      );

      const response = await request(app)
        .delete("/api/activate-challenge")
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to delete active challenge");
    });
  });
});
