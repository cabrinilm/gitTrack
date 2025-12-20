import request from "supertest";
import app from "../../src/server";
import { getProfile } from "../../src/services/profile.service";
import { supabase } from "../../src/services/supabaseClient"; // importe o supabase global

jest.mock("../../src/services/profile.service");
jest.mock("../../src/services/supabaseClient"); // mocka o supabase global

describe("GET /api/profile", () => {
  it("should return 200 and the user's profile when authenticated", async () => {
    const fakeProfile = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
      name: "Test User",
      created_at: "2025-12-20T00:00:00Z", // string ISO qualquer
      updated_at: "2025-12-20T00:00:00Z",
    };

    (getProfile as jest.Mock).mockResolvedValue(fakeProfile);

    // Mock da validação do token
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: "123e4567-e89b-12d3-a456-426614174000" } },
      error: null,
    });

    const response = await request(app)
      .get("/api/profile")
      .set("Authorization", "Bearer any-fake-token")
      .expect(200);

    // Aqui usamos o matcher para as datas
    expect(response.body).toEqual({
      id: fakeProfile.id,
      email: fakeProfile.email,
      name: fakeProfile.name,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});