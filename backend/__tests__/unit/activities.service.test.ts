import type { Activities } from "../../src/services/activities.service";
import { getActivities} from "../../src/services/activities.service";



describe("Activities", () => {
    
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
    const fakeChallengeId = 2;



    describe("GET /api/activities", () => {
        it("returns activities for a valid requestr", async () => {

            const listActivities = [
                {id: 1,
                 challenge_id: fakeChallengeId,
                 name: "Gym workout",
                 duration_minutes: 60,
                 order_num: 1
               },
                {id: 2,
                 challenge_id: fakeChallengeId,
                 name: "Sleep",
                 duration_minutes: 480,
                 order_num: 2
               },
               {id: 3,
                challenge_id: fakeChallengeId,
                name: "Health meal",
                duration_minutes: 20,
                order_num: 3
              }
        
        ];

        
     const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                data: 
                  column === "challenge_id" && value === fakeChallengeId &&
                  column2 === "user_id" && value2 === fakeUserId
                    ? listActivities
                    : [],
                error: null,
              }),
            }),
          }),
        }),
      };
            
      const userActivities: Activities[] = await getActivities(
        mockSupabase as any, 
        fakeUserId,
        fakeChallengeId
      );

      expect(userActivities).toEqual(listActivities);
        });
    });
});