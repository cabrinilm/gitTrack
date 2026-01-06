import request from "supertest";
import app from "../../src/server";
import {
  getChallenges,
  createChallenge,
} from "../../src/services/challenges.service";
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
  it("should return 200 and empty array if user does not have created challenges", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    (getChallenges as jest.Mock).mockResolvedValue([]);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .get("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .expect(200);

    expect(response.body).toEqual([]);
    expect(getChallenges).toHaveBeenCalledWith(expect.any(Object), fakeUserId);
  });
  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/challenges").expect(401);

    expect(response.body.error).toEqual("No token provided");
  });
  it("should return 500 if an unexpected server error occurs", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    (getChallenges as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch challenges")
    );

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .get("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .expect(500);

    expect(response.body.error).toBe("Failed to fetch challenges");
  });
});

describe("POST /api/challenges", () => {
  it("should return 201 and the challenge created", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

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

    console.log(typeof createChallenge);

    (createChallenge as jest.Mock).mockResolvedValue(challengeCreated);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .post("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .send(newChallenge)
      .expect(201);

    expect(response.body).toEqual(challengeCreated);
  });
  it("should return 201 and the challenge created if description is empty", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "Basic goals",
      description:"",
    };

    const challengeCreated = {
      ...newChallenge,
      id: "fake-id-123",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: fakeUserId,
    };

    console.log(typeof createChallenge);

    (createChallenge as jest.Mock).mockResolvedValue(challengeCreated);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .post("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .send(newChallenge)
      .expect(201);

    expect(response.body).toEqual(challengeCreated);
  });
  it("should return 401 if no token is provided", async () => {
    const response = await request(app).post("/api/challenges").expect(401);

    expect(response.body.error).toEqual("No token provided");
  });
  it("should return 400 when challenge name exceeds maximum length", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "Basic goals,Basic goals,Basic goals",
      description: "I want to learn 3 new activities",
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

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
  it("should return 400 when challenge name is an empty string", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "",
      description: "I want to learn 3 new activities",
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

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
  it("should return 400 when challenge description exceeds maximum length", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "New Challenge",
      description: "I want to learn 3 new activities,I want to learn 3 new activities,I want to learn 3 new activities",
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

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
  it("should return 500 if an unexpected server error occurs", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";


    const newChallenge = {
      name: "New Challenge",
      description: "I want to learn 3 new activities.",
    };

    (createChallenge as jest.Mock).mockRejectedValue(
      new Error("Failed to create new challenge")
    );

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .post("/api/challenges")
      .set("Authorization", "Bearer any-fake-token")
      .send(newChallenge)
      .expect(500);

    expect(response.body.error).toBe("Failed to create new challenge");
  });
});
