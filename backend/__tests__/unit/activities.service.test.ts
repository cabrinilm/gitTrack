import type { Activities } from "../../src/services/activities.service";
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity
} from "../../src/services/activities.service";

describe("Activities", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;
  const fakeActivityId = 4;

  describe("GET /api/:challengeId/activities", () => {
    it("returns activities for a valid request", async () => {
      const listActivities = [
        {
          id: 1,
          challenge_id: fakeChallengeId,
          name: "Gym workout",
          duration_minutes: 60,
          order_num: 1,
        },
        {
          id: 2,
          challenge_id: fakeChallengeId,
          name: "Sleep",
          duration_minutes: 480,
          order_num: 2,
        },
        {
          id: 3,
          challenge_id: fakeChallengeId,
          name: "Health meal",
          duration_minutes: 20,
          order_num: 3,
        },
      ];

      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                data:
                  column === "user_id" &&
                  value === fakeUserId &&
                  column2 === "challenge_id" &&
                  value2 === fakeChallengeId
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
    it("returns an empty array when the user has no activities", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                data:
                  column === "user_id" &&
                  value === fakeUserId &&
                  column2 === "challenge_id" &&
                  value2 === fakeChallengeId
                    ? []
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

      expect(userActivities).toEqual([]);
      expect(userActivities).toHaveLength(0);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                data: null,
                error: { message: "Failed to fetch activities" },
              }),
            }),
          }),
        }),
      };

      await expect(
        getActivities(mockSupabase as any, fakeUserId, fakeChallengeId)
      ).rejects.toThrow("Failed to fetch activities");
    });
  });
  describe("GET /api/:challengeId/activities/activitiesId", () => {
    it("returns specific activity for a valid request", async () => {
      const activity = {
        id: 1,
        challenge_id: fakeChallengeId,
        name: "Gym workout",
        duration_minutes: 60,
        order_num: 1,
      };

      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                eq: (column3: string, value3: any) => ({
                  single: async () => ({
                    data:
                      column === "user_id" &&
                      value === fakeUserId &&
                      column2 === "challenge_id" &&
                      value2 === fakeChallengeId &&
                      column3 === "id" &&
                      value3 === fakeActivityId
                        ? activity
                        : null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      const userActivitie: Activities = await getActivityById(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId,
        fakeActivityId
      );

      expect(userActivitie).toEqual(activity);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: () => ({
          select: () => ({
            eq: (column: string, value: any) => ({
              eq: (column2: string, value2: any) => ({
                eq: (column3: string, value3: any) => ({
                  single: async () => ({
                    data: null,
                    error: { message: "Failed to fetch activity" },
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      await expect(
        getActivityById(
          mockSupabase as any,
          fakeUserId,
          fakeChallengeId,
          fakeActivityId
        )
      ).rejects.toThrow("Failed to fetch activity");
    });
  });
  describe("POST /api/:challengeId/activities", () => {
    const newActivity = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    it("returns activity for a valid request", async () => {
       

      const activity: Activities = {
        ...newActivity,
        user_id: fakeUserId,
        id: fakeActivityId,
        challenge_id: fakeChallengeId,
        order_num: 1,
      };

      const mockSupabase = {
        from: jest.fn(),
      };

      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockInsert = jest.fn();
      const mockSingle = jest.fn();

      //  COUNT QUERY
      mockEq.mockResolvedValueOnce({
        count: 0,
        error: null,
      });

      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });

      //  INSERT QUERY
      mockSingle.mockResolvedValueOnce({
        data: {
          ...newActivity,
          id: fakeActivityId,
          user_id: fakeUserId,
          challenge_id: fakeChallengeId,
          order_num: 1,
        },
        error: null,
      });

      mockInsert.mockReturnValueOnce({
        select: () => ({
          single: mockSingle,
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const userActivity: Activities = await createActivity(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId,
        newActivity
      );

      expect(userActivity).toEqual(activity);
    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: jest.fn(),
      };

      const mockSelect = jest.fn();
      const mockEq = jest.fn();
      const mockInsert = jest.fn();
      const mockSingle = jest.fn();

      //  COUNT QUERY
      mockEq.mockResolvedValueOnce({
        count: 0,
        error: null,
      });

      mockSelect.mockReturnValueOnce({
        eq: mockEq,
      });

      //  INSERT QUERY
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Failed to create new activity" },
      });

      mockInsert.mockReturnValueOnce({
        select: () => ({
          single: mockSingle,
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      await expect(
        createActivity(mockSupabase as any, fakeUserId, fakeChallengeId, newActivity)
      ).rejects.toThrow("Failed to create new activity");
    });
  });
  describe("PATH /api/:challengeId/activities/:activityId", () => {

    const activityUpdate = {
      name: "Name updated",
      duration_minutes: 10
    }
    it("returns updated activity for a valid request ", async () => {

  

      const expectedUpdatedActivity: Activities = {
        ...activityUpdate, 
        id: fakeActivityId,
        user_id: fakeUserId,
        challenge_id: fakeChallengeId,
        order_num: 1
      };

      const mockSupabase = {
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn(async () => ({
                      data: expectedUpdatedActivity,
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      };
  
      const updatedActivity = await updateActivity(
        mockSupabase as any,
        fakeUserId,
        fakeChallengeId,
        fakeActivityId,
        activityUpdate
      );
  
      expect(updatedActivity).toEqual(expectedUpdatedActivity);



    });
    it("should throw an error if Supabase returns an error", async () => {
      const mockSupabase = {
        from: jest.fn(() => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  select: jest.fn(() => ({
                    single: jest.fn(async () => ({
                      data: null,
                      error: {message: "Failed to update activity"},
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      };

      await expect(
        updateActivity(mockSupabase as any, fakeUserId, fakeChallengeId,fakeActivityId,activityUpdate )
      ).rejects.toThrow("Failed to update activity");
    });
  });
});
