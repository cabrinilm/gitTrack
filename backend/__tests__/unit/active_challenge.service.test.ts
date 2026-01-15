import { Challenges } from "../../src/services/challenges.service";
import { getActiveChallenge } from "../../src/services/active_challenge.service";

describe("Active_challenge", () => {

    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
    const fakeChallengeId = 2;

    describe("GET /api/active-challenge", () => {
        it("returns the active challenge for a valid request", async () => {
            const expectedChallenge = {
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
      });
});