import type { Challenges } from "../../src/services/challenges.service";
import {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../../src/services/challenges.service";
describe("Challenges", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;

  describe("GET /api/challenges", () => {
    it("should return all challenges created by user", async () => {
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

      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: string) => ({
              data: value === fakeUserId ? listChallenges : [],
              error: null,
            }),
          }),
        }),
      };

      const userChallenges: Challenges[] = await getChallenges(
        mockSupabase as any,
        fakeUserId
      );

      expect(userChallenges).toEqual(listChallenges);
    });
    it("should return an empty array if user does not have created challenges", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: string) => ({
              data: [],
              error: null,
            }),
          }),
        }),
      };

      const userChallenges: Challenges[] = await getChallenges(
        mockSupabase as any,
        fakeUserId
      );

      expect(userChallenges).toEqual([]);
    });
    it("should throw an error if Supabase return an error", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: string) => ({
              data: null,
              error: { message: "Permission denied" },
            }),
          }),
        }),
      };

      await expect(
        getChallenges(mockSupabase as any, fakeUserId)
      ).rejects.toThrow("Failed to fetch challenges");
    });
  });
  describe("GET /api/challenges/:challengeId", () => {
    it("should return the challenge selected by user", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (col1: string, val1: any) => ({
              eq: (col2: string, val2: any) => ({
                single: async () => ({
                  data: {
                    id: fakeChallengeId,
                    user_id: fakeUserId,
                    name: "Basic goals",
                    description: "I want to learn 3 new activities",
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      };

      const userChallenge: Challenges = await getChallengeById(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId
      );

      expect(userChallenge).toEqual(
        expect.objectContaining({
          id: fakeChallengeId,
          user_id: fakeUserId,
          name: "Basic goals",
          description: "I want to learn 3 new activities",
        })
      );
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (col1: string, val1: any) => ({
              eq: (col2: string, val2: any) => ({
                single: async () => ({
                  data: null,
                  error: { message: "Failed to fetch challenge " },
                }),
              }),
            }),
          }),
        }),
      };

      await expect(
        getChallengeById(mockSupabase as any, fakeUserId, fakeChallengeId)
      ).rejects.toThrow("Failed to fetch challenge");
    });
  });

  describe("POST /api/challenges", () => {
    const newChallenge = {
      name: "Basic goals",
      description: "I want to learn 3 new activities",
    };

    it("should return the challenge created by user", async () => {
      const challengeCreated = {
        ...newChallenge,
        id: "fake-id-123",
        created_at: "2026-01-04T15:57:53.336Z",
        updated_at: "2026-01-04T15:57:53.337Z",
        user_id: fakeUserId,
      };

      const mockSupabase = {
        from: () => ({
          insert: (newChallenge: Partial<Challenges>) => ({
            select: () => ({
              single: async () => ({
                data: {
                  ...newChallenge,
                  id: "fake-id-123",
                  created_at: "2026-01-04T15:57:53.336Z",
                  updated_at: "2026-01-04T15:57:53.337Z",
                  user_id: fakeUserId,
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      const userChallenges: Challenges = await createChallenge(
        mockSupabase as any,
        fakeUserId,
        newChallenge
      );

      expect(userChallenges).toEqual(challengeCreated);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: () => ({
          insert: (newChallenge: Partial<Challenges>) => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: { message: "Permission denied" },
              }),
            }),
          }),
        }),
      };

      await expect(
        createChallenge(mockSupabase as any, fakeUserId, newChallenge)
      ).rejects.toThrow("Failed to create new challenge");
    });
  });

  describe("PATCH /api/challenges/:challengeId", () => {
    it("should update challenge and return updated data", async () => {
      const updates = {
        name: "Name updated",
        description: "New description",
      };

      const expectedUpdatedChallenge = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Name updated",
        description: "New description",
        created_at: "2026-01-04T15:57:53.336Z",
        updated_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: () => ({
          update: (receivedUpdates: Partial<Challenges>) => ({
            eq: (column1: string, value1: string) => ({
              eq: (column2: string, value2: string) => ({
                select: () => ({
                  single: async () => ({
                    data: {
                      ...receivedUpdates,
                      id: fakeChallengeId,
                      user_id: fakeUserId,
                      created_at: "2026-01-04T15:57:53.336Z",
                      updated_at: expectedUpdatedChallenge.updated_at,
                    },
                    error: null,
                  }),
                }),
              }),

              select: () => ({
                single: async () => ({
                  data: null,
                  error: { message: "Challenge not found" },
                }),
              }),
            }),
          }),
        }),
      };

      const updated = await updateChallenge(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId,
        updates
      );

      expect(updated).toEqual(expectedUpdatedChallenge);
    });
    it("should throw an error if Supabase returns an error", async () => {
     
      const updates = {
        name: "Name updated",
        description: "New description",
      };

      const mockSupabase = {
        from: () => ({
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: { message: "Failed to update challenge" },
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      await expect(
        updateChallenge(
          mockSupabase as any,
          fakeUserId,
          fakeChallengeId,
          updates
        )
      ).rejects.toThrow("Failed to update challenge");
    });
  });

  describe("DELETE  /api/challenges/:challengeId", () => {
    it("should return the deleted challenge data", async () => {
     

      const deletedChallengeData = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Challenge to delete",
        description: "This will be deleted",
        created_at: "2026-01-04T15:57:53.336Z",
        updated_at: "2026-01-04T15:57:53.336Z",
      };

      const mockSupabase = {
        from: () => ({
          delete: () => ({
            eq: (column1: string, value1: any) => ({
              eq: (column2: string, value2: any) => ({
                select: () => ({
                  single: async () => ({
                    data: deletedChallengeData,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const result = await deleteChallenge(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId
      );

      expect(result).toEqual(deletedChallengeData);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: () => ({
          delete: () => ({
            eq: (column1: string, value1: any) => ({
              eq: (column2: string, value2: any) => ({
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: { message: "Failed to delete challenge" },
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      await expect(
        deleteChallenge(mockSupabase as any, fakeUserId, fakeChallengeId)
      ).rejects.toThrow("Failed to delete challenge");
    });
  });
});
