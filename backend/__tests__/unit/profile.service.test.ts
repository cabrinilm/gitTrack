import type { Profile } from "../../src/services/profile.service";
import { getProfile, updateProfile } from "../../src/services/profile.service";

describe("Profile GET", () => {
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
          eq: (column: string, value: string) => ({
            single: async () => {
              if (value === fakeUserId) {
                return { data: fakeProfile, error: null };
              } else {
                return { data: null, error: null };
              }
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
  it("should thrown an error if the profile is not found", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
    const userNotFound = "123e4567-e89b-12d3-a456-426614174111";

    const fakeProfile = {
      id: fakeUserId,
      email: "test@example123.com",
      name: "Test User",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: (column: string, value: string) => ({
            single: async () => {
              if (value === fakeUserId) {
                return { data: fakeProfile, error: null };
              } else {
                return { data: null, error: null };
              }
            },
          }),
        }),
      }),
    };

    const profile = await getProfile(mockSupabase as any, userNotFound);

    expect(profile).toBeNull();
  });
  describe("Profile POST", () => {
    it("should update the profile name and return the updated profile", async () => {
      const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

      const initialProfile = {
        id: fakeUserId,
        email: "test@example.com",
        name: "Old Name",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const updates = {
        name: "New Name",
      };

      const expectedProfile = {
        ...initialProfile,
        name: "New Name",
        updated_at: expect.any(String),
      };

      const mockSupabase = {
        from: () => ({
          update: (body: Partial<Profile>) => ({
            eq: (col: string, val: string) => ({
              select: () => ({
                single: async () => {
                  if (val === fakeUserId) {
                    return {
                      data: {
                        ...initialProfile,
                        ...body,
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
              }),
            }),
          }),
        }),
      };

      const result = await updateProfile(
        mockSupabase as any,
        fakeUserId,
        updates
      );

      expect(result).toEqual(expectedProfile);
    });
    it.only("should throw an error if profile is not found", async () => {
      const existingUserId = "123e4567-e89b-12d3-a456-426614174000";
      const notFoundUserId = "123e4567-e89b-12d3-a456-426614174123";

      const initialProfile = {
        id: existingUserId,
        email: "test@example.com",
        name: "Old Name",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      const updates = {
        name: "New Name",
      };

      const mockSupabase = {
        from: () => ({
          update: (body: Partial<Profile>) => ({
            eq: (col: string, val: string) => ({
              select: () => ({
                single: async () => {
                  if (val === existingUserId) {
                    return {
                      data: {
                        ...initialProfile,
                        ...body,
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
              }),
            }),
          }),
        }),
      };

      await expect(
        updateProfile(mockSupabase as any, notFoundUserId, updates)
      ).rejects.toThrow("Profile not found or update failed");
    });
  });
});
