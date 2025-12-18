import request from "supertest";
import app from "../../src/server";
import { getProfile } from "../../src/services/profile.service";

jest.mock("../../src/services/profile.service");

describe("GET /api/profile", () => {
  it("should return 200 and the user's profile when authenticated", async () => {
    const fakeProfile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      name: "Test User",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    };
    (getProfile as jest.Mock).mockResolvedValue(fakeProfile);

    const response = await request(app)
      .get("/api/profile")
      .expect(200); 

  
    expect(response.body).toEqual(fakeProfile);
  });
});
