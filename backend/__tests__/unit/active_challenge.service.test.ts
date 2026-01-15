import {
  Challenges,
  updateChallenge,
} from "../../src/services/challenges.service";
import {
  getActiveChallenge,
  activateChallenge,
} from "../../src/services/active_challenge.service";

describe("Active_challenge", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;

  describe("GET /api/active-challenge", () => {
    it("returns the active challenge for a valid request", async () => {
      const expectedChallenge: Challenges = {
        id: fakeChallengeId,
        user_id: fakeUserId,
        name: "Active challenge",
        description: "Test the output",
        created_at: new Date().toISOString(),
      };

      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                challenge_id: fakeChallengeId,
                activated_at: new Date().toISOString(),
                challenges: expectedChallenge,
              },
              error: null,
            }),
          })),
        })),
      };

      const result = await getActiveChallenge(mockSupabase as any, fakeUserId);

      expect(result).toEqual(expectedChallenge);
    });
    it("returns null  if no active challenge for a valid request", async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      };

      const result = await getActiveChallenge(mockSupabase as any, fakeUserId);

      expect(result).toEqual(null);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { error: "Failed to fetch active challenge" },
            }),
          })),
        })),
      };

      await expect(
        getActiveChallenge(mockSupabase as any, fakeUserId)
      ).rejects.toThrow("Failed to fetch active challenge");
    });
  });
  describe("POST /api/challenges/:challendId/activate", () => {
    it("returns the actived challenge for a valid request", async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: {
          user_id: fakeUserId,
          challenge_id: fakeChallengeId,
          activated_at: new Date().toISOString(),
        },
        error: null,
      });

      const selectMock = jest.fn(() => ({
        single: singleMock,
      }));

      const upsertMock = jest.fn(() => ({
        select: selectMock,
      }));

      const fromMock = jest.fn(() => ({
        upsert: upsertMock,
      }));

      const mockSupabase = {
        from: fromMock,
      };

      const result = await activateChallenge(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId
      );

      expect(result).toEqual({
        user_id: fakeUserId,
        challenge_id: fakeChallengeId,
        activated_at: expect.any(String),
      });

      expect(fromMock).toHaveBeenCalledWith("active_challenges");
      expect(upsertMock).toHaveBeenCalledWith(
        {
          user_id: fakeUserId,
          challenge_id: fakeChallengeId,
          activated_at: expect.any(String),
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      );
    });
    it("should throw an error if Supabase returns an error", async () => {
      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: {error:"Failed to activate challenge"},
      });

      const selectMock = jest.fn(() => ({
        single: singleMock,
      }));

      const upsertMock = jest.fn(() => ({
        select: selectMock,
      }));

      const fromMock = jest.fn(() => ({
        upsert: upsertMock,
      }));

      const mockSupabase = {
        from: fromMock,
      };

      await expect(
        activateChallenge(mockSupabase as any, fakeUserId, fakeChallengeId)
      ).rejects.toThrow("Failed to activate challenge");
    });
  });
});
