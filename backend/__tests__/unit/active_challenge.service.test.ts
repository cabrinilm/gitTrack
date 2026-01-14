import { Challenges } from "../../src/services/challenges.service";


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
                eq: jest.fn(() => ({
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
            })),
          };
      
          const result = await getActiveChallenge(mockSupabase as any, fakeUserId);
      
          expect(result).toEqual(expectedChallenge);
      
          // Verificações rigorosas no mock
          expect(mockSupabase.from).toHaveBeenCalledWith("active_challenges");
          expect(mockSupabase.from().select).toHaveBeenCalledWith(
            "challenge_id, activated_at, challenges(name, description, created_at)"
          );
          expect(mockSupabase.from().select().eq).toHaveBeenCalledWith("user_id", fakeUserId);
          expect(mockSupabase.from().select().eq().single).toHaveBeenCalled();
        });
      });
});