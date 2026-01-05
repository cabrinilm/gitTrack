import type { Challenges } from "../../src/services/challenges.service";
import { getChallenges, createChallenge} from "../../src/services/challenges.service";

describe("Challenges GET", () => {
  it("should return all challenges created by user", async () => {
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
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

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
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

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

describe("Challenges POST", () => {
  it("should return the challenge created by user", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "Basic goals",
      description: "I want to learn 3 new activities",
    };

    const challengeCreated = {
      ...newChallenge,
      id: "fake-id-123",
      created_at: "2026-01-04T15:57:53.336Z",
      updated_at: "2026-01-04T15:57:53.337Z",
      user_id: fakeUserId,
    }

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
      fakeUserId, newChallenge
    );
 
  
    expect(userChallenges).toEqual(challengeCreated);
  });
  it.only("should throw an error if Supabase return an error", async () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";

    const newChallenge = {
      name: "Basic goals",
      description: "I want to learn 3 new activities",
    };

  
    const mockSupabase = {
      from: () => ({
        insert: (newChallenge: Partial<Challenges>) => ({
          select: () => ({
            single: async () => ({
              data: 
               null
              ,
              error: { message: "Failed to create new challenge"},
            }),
          }),
        }),
      }),
    };

    await expect(
      createChallenge(mockSupabase as any, fakeUserId, newChallenge)
    ).rejects.toThrow("Failed to create new challenge")

  })
});
