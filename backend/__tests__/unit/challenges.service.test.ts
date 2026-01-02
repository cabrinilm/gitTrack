import type { Challenges } from "../../src/services/challenges.service"
import { getChallenges } from "../../src/services/challenges.service";


describe("Challenges GET", () => {
  it("should return all challenges created by an user", async () => {
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

    const userChallenges : Challenges[] = await getChallenges(mockSupabase as any, fakeUserId);

    expect(userChallenges).toEqual(listChallenges);
  });
  it.only("should return an empty array if user does not have created challenges", async () => {
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

  const userChallenges : Challenges[] = await getChallenges(mockSupabase as any, fakeUserId);

  expect(userChallenges).toEqual([]);

   
  })
});
