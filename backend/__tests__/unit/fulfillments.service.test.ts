import { postFulfillActivity } from "../../src/services/fulfillments.service";

describe("Fulfillments Service", () => {
  describe("fulfillActivity", () => {
    const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
    const fakeActivityId = 4;
    const fakeFulfillmentsId = 1;
    const fakeProgressEntryId = 3;

    const newActivity = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    it("returns the fulfillment object for a valid request", async () => {
      // Mock do Supabase
      const mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === "activities") {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => ({
                    single: jest.fn().mockResolvedValue({
                      data: newActivity,
                      error: null,
                    }),
                  }),
                }),
              }),
            };
          }

          if (table === "daily_activity_fulfillments") {
            return {
              insert: () => ({
                select: () => ({
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: fakeFulfillmentsId,
                      progress_entry_id: fakeProgressEntryId,
                      activity_id: fakeActivityId,
                      activity_name: newActivity.name,
                      planned_duration_minutes: newActivity.duration_minutes,
                      fulfilled_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            };
          }

          return {};
        }),
        rpc: jest.fn().mockResolvedValue({
          data: fakeProgressEntryId,
          error: null,
        }),
      };

      const result = await postFulfillActivity(
        mockSupabase as any,
        fakeUserId,
        fakeActivityId
      );

      expect(result).toEqual({
        success: true,
        fulfillment: {
          id: fakeFulfillmentsId,
          progress_entry_id: fakeProgressEntryId,
          activity_id: fakeActivityId,
          activity_name: newActivity.name,
          planned_duration_minutes: newActivity.duration_minutes,
          fulfilled_at: expect.any(String),
        },
        progressEntryId: fakeProgressEntryId,
      });

      // Checa se a RPC e inserts foram chamados
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_or_create_progress_entry",
        {
          p_user_id: fakeUserId,
          p_today: expect.any(String),
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("activities");
      expect(mockSupabase.from).toHaveBeenCalledWith("daily_activity_fulfillments");
    });
  });
});
