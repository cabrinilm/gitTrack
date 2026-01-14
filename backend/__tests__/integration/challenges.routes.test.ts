import request from "supertest";
import app from "../../src/server";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallengeById,
  Challenges,
} from "../../src/services/challenges.service";
import { supabase } from "../../src/services/supabaseClient";

jest.mock("../../src/services/challenges.service");
jest.mock("../../src/services/supabaseClient");

describe("Challenges", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = "234";

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });
  });

  describe("GET /api/challenges", () => {
    it("returns 200 and all challenges created by the user", async () => {
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

      const response = await request(app)
        .get("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual(listChallenges);
      expect(getChallenges).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId
      );
    });
    it("returns 200 and empty array if user does not have created challenges", async () => {
      (getChallenges as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual([]);
      expect(getChallenges).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app).get("/api/challenges").expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (getChallenges as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch challenges")
      );

      const response = await request(app)
        .get("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to fetch challenges");
    });
  });
  describe("GET /api/challenges/:challengeId", () => {
    it("returns 200 and the selected challenge", async () => {
      const selectedChallenge = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Basic goals",
        description: "I want to learn 3 new activities",
        created_at: new Date().toISOString(),
      };

      (getChallengeById as jest.Mock).mockResolvedValue(selectedChallenge);

      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual(selectedChallenge);
      expect(getChallengeById).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        Number(fakeChallengeId)
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (getChallengeById as jest.Mock).mockRejectedValue(null);

      const response = await request(app)
        .get(`/api/challenges/123`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toEqual("Failed to fetch challenge");
    });
  });

  describe("POST /api/challenges", () => {
    it("returns 201 and the challenge created", async () => {
      const newChallenge = {
        name: "Basic goals",
        description: "I want to learn 3 new activities",
      };

      const challengeCreated = {
        ...newChallenge,
        id: "fake-id-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: fakeUserId,
      };

      (createChallenge as jest.Mock).mockResolvedValue(challengeCreated);

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(201);

      expect(response.body).toEqual(challengeCreated);
    });
    it("returns 201 and the challenge created if description is empty", async () => {
      const newChallenge = {
        name: "Basic goals",
        description: "",
      };

      const challengeCreated = {
        ...newChallenge,
        id: "fake-id-123",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: fakeUserId,
      };

      (createChallenge as jest.Mock).mockResolvedValue(challengeCreated);

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(201);

      expect(response.body).toEqual(challengeCreated);
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app).post("/api/challenges").expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 when challenge name exceeds maximum length", async () => {
      const newChallenge = {
        name: "Basic goals,Basic goals,Basic goals",
        description: "I want to learn 3 new activities",
      };

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.name?.errors).toEqual([
        "Name too long",
      ]);
    });
    it("returns 400 when challenge name is an empty string", async () => {
      const newChallenge = {
        name: "",
        description: "I want to learn 3 new activities",
      };

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.name?.errors).toEqual([
        "Name cannot be empty",
      ]);
    });
    it("returns 400 when challenge description exceeds maximum length", async () => {
      const newChallenge = {
        name: "New Challenge",
        description:
          "I want to learn 3 new activities,I want to learn 3 new activities,I want to learn 3 new activities",
      };

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.description?.errors).toEqual([
        "Description too long",
      ]);
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      const newChallenge = {
        name: "New Challenge",
        description: "I want to learn 3 new activities.",
      };

      (createChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to create new challenge")
      );

      const response = await request(app)
        .post("/api/challenges")
        .set("Authorization", "Bearer any-fake-token")
        .send(newChallenge)
        .expect(500);

      expect(response.body.error).toBe("Failed to create new challenge");
    });
  });

  describe("PATCH /api/challenges/:id", () => {
    it("returns 200 and the updated challenge when update is successful", async () => {
      const update = {
        name: "Name updated",
        description: "New description",
      };

      const expectedUpdatedChallenge: Challenges = {
        id: Number(fakeChallengeId),
        user_id: fakeUserId,
        name: "Name updated",
        description: "New description",
        created_at: "2026-01-04T15:57:53.336Z",
      };

      (updateChallenge as jest.Mock).mockResolvedValue(
        expectedUpdatedChallenge
      );

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(200);

      expect(response.body).toEqual(expectedUpdatedChallenge);
      expect(updateChallenge).toHaveBeenCalledWith(
        expect.anything(),
        fakeUserId,
        Number(fakeChallengeId),
        update
      );
    });
    it("returns 200 and the updated challenge when update without description is successful", async () => {
      const update = {
        name: "Name updated",
        description: "",
      };

      const expectedUpdatedChallenge = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Name updated",
        created_at: "2026-01-04T15:57:53.336Z",
        updated_at: "2026-01-04T15:57:53.399Z",
      };

      (updateChallenge as jest.Mock).mockResolvedValue(
        expectedUpdatedChallenge
      );

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(200);

      expect(response.body).toEqual(expectedUpdatedChallenge);
      expect(updateChallenge).toHaveBeenCalledWith(
        expect.anything(),
        fakeUserId,
        Number(fakeChallengeId),
        update
      );
    });
    it("returns 401 if no token is provided", async () => {
      const update = {
        name: "Name updated",
      };
      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .send(update)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 when challenge name exceeds maximum length", async () => {
      const update = {
        name: "Basic goals,Basic goals,Basic goals",
        description: "I want to learn 3 new activities",
      };

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.name?.errors).toEqual([
        "Name too long",
      ]);
    });
    it("returns 400 when challenge name is an empty string", async () => {
      const update = {
        name: "",
        description: "I want to learn 3 new activities",
      };

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.name?.errors).toEqual([
        "Name cannot be empty",
      ]);
    });
    it("returns 400 when challenge description exceeds maximum length", async () => {
      const update = {
        name: "New Challenge",
        description:
          "I want to learn 3 new activities,I want to learn 3 new activities,I want to learn 3 new activities",
      };

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
      expect(response.body.details?.properties?.description?.errors).toEqual([
        "Description too long",
      ]);
    });
    it("returns 500 when an unexpected server error occurs", async () => {
      const update = {
        name: "New Challenge",
        description: "Activities",
      };

      (updateChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to update challenge")
      );

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(500);

      expect(response.body.error).toBe("Failed to update challenge");
    });
  });

  describe("DELETE /api/challenges/:id", () => {
    it("returns 200 with the deleted challenge", async () => {
      const deletedChallengeData = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Challenge to delete",
        description: "This will be deleted",
        created_at: "2026-01-04T15:57:53.336Z",
        updated_at: "2026-01-04T15:57:53.336Z",
      };

      (deleteChallenge as jest.Mock).mockResolvedValue(deletedChallengeData);

      const response = await request(app)
        .delete(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual(deletedChallengeData);
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .delete(`/api/challenges/1`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 if challenge id is invalid", async () => {
      const fakeChallengeId = "234@";

      const response = await request(app)
        .delete(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);

      expect(response.body.error).toBe("Invalid challenge id");
    });
    it("returns 500 when if an unexpected server error occurs", async () => {
      (deleteChallenge as jest.Mock).mockRejectedValue(
        new Error("Failed to delete challenge")
      );

      const response = await request(app)
        .delete(`/api/challenges/${fakeChallengeId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to delete challenge");
    });
  });
});
