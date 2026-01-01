import request from "supertest";
import app from "../../src/server";
import { getProfile, updateProfile } from "../../src/services/profile.service";
import { supabase } from "../../src/services/supabaseClient";

jest.mock("../../src/services/profile.service");
jest.mock("../../src/services/supabaseClient");

describe("GET /api/profile", () => {
  it("should return 200 and the user's profile when authenticated", async () => {
    const fakeProfile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      name: "Test User",
      created_at: "2025-12-20T00:00:00Z",
      updated_at: "2025-12-20T00:00:00Z",
    };

    (getProfile as jest.Mock).mockResolvedValue(fakeProfile);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "123e4567-e89b-12d3-a456-426614174000" } },
      error: null,
    });

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer any-fake-token")
      .expect(200);

    expect(response.body).toEqual({
      id: fakeProfile.id,
      email: fakeProfile.email,
      name: fakeProfile.name,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/profile").expect(401);

    expect(response.body.error).toEqual("No token provided");
  });
  it("should return 404 if profile not found", async () => {
    (getProfile as jest.Mock).mockResolvedValue(null);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "123..." } },
      error: null,
    });

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer fake-token")
      .expect(404);

    expect(response.body.error).toBe("Profile not found");
  });
});

describe("PATCH /api/profile", () => {
  it("should return 200 and the profile updated", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const fakeProfile = {
      id: fakeUserId,
      email: "test@example.com",
      name: "Test User",
      created_at: "2025-12-20T00:00:00Z",
      updated_at: "2025-12-20T00:00:00Z",
    };

    const expectedProfile = {
      ...fakeProfile,
      name: "New Name",
      updated_at: "2025-12-21T10:00:00Z",
    };

    const update = {
      name: "New Name",
    };

    (updateProfile as jest.Mock).mockResolvedValue(expectedProfile);

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", "Bearer any-fake-token")
      .send(update)
      .expect(200);

    expect(response.body).toEqual(expectedProfile);
  });
  it("should return 401 if no token is provided", async () => {
    const response = await request(app).post("/api/profile").expect(401);

    expect(response.body.error).toEqual("No token provided");
  });
  it("should return 404 if profile does not exist", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const updates = {
      name: "New Name",
    };

    (updateProfile as jest.Mock).mockRejectedValue(
      new Error("Profile not found")
    );

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", "Bearer fake-token")
      .send(updates)
      .expect(404);

    expect(response.body.error).toBe("Profile not found");
  });
  it("should return 400 if name is invalid (too long)", async () => {
    const invalidUpdate = {
      name: "A".repeat(51),
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "123..." } },
      error: null,
    });

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", "Bearer fake-token")
      .send(invalidUpdate)
      .expect(400);

    expect(response.body.error).toBe("Invalid name");
  });
  it("should return 500 if the server is broken", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";


    const update = {
      name: "New Name",
    };

    (updateProfile as jest.Mock).mockRejectedValue(
      new Error("Failed to update profile")
    );


    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });

    const response = await request(app)
      .patch("/api/profile")
      .set("Authorization", "Bearer any-fake-token")
      .send(update)
      .expect(500);

      expect(response.body.error).toBe("Failed to update profile");
  });
});
