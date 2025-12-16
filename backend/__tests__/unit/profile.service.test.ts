import { getProfile } from "../../src/services/profile.service";

describe("Profile Service", () => {
  it("should return the user's profile when it exists", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const fakeProfile = {
      id: fakeUserId,
      email: "test@example.com",
      name: "Test User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

   
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => {
              return { data: fakeProfile, error: null };
            },
          }),
        }),
      }),
    };


    const profile = await getProfile(mockSupabase as any, fakeUserId);


    expect(profile).toEqual(fakeProfile);
    expect(profile.email).toBe("test@example.com");
    expect(profile.name).toBe("Test User");
  });
});