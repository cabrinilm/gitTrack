import {
  Fulfillments,
  postFulfillActivity,
  getFulfillmentsByDate,
} from "../../src/services/fulfillments.service";

describe("Fulfillments Service", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeActivityId = 4;
  const fakeFulfillmentsId = 1;
  const fakeProgressEntryId = 3;
  const fakeDate = "2025-03-20";

  const newActivity = {
    name: "Gym workout",
    duration_minutes: 60,
  };

  describe("POST /api/fulfillments", () => {
    it("returns the fulfillment object for a valid request", async () => {
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

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_or_create_progress_entry",
        {
          p_user_id: fakeUserId,
          p_today: expect.any(String),
        }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("activities");
      expect(mockSupabase.from).toHaveBeenCalledWith(
        "daily_activity_fulfillments"
      );
    });
  });
  describe("GET /api/:date/fulfillments", () => {
    it("returns the fulfillments for a specific date when progress entry exists", async () => {
      const fakeFulfillments = [
        {
          id: 1,
          progress_entry_id: fakeProgressEntryId,
          activity_id: fakeActivityId,
          activity_name: "Gym workout",
          planned_duration_minutes: 60,
          fulfilled_at: "2025-03-20T10:00:00Z",
        },
      ];

      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: fakeProgressEntryId },
        error: null,
      });

      const mockEqProgress = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: mockSingle,
        }),
      });

      const mockSelectProgress = jest.fn().mockReturnValue({
        eq: mockEqProgress,
      });

      const mockOrder = jest.fn().mockResolvedValue({
        data: fakeFulfillments,
        error: null,
      });

      const mockEqFulfillments = jest.fn().mockReturnValue({
        order: mockOrder,
      });

      const mockSelectFulfillments = jest.fn().mockReturnValue({
        eq: mockEqFulfillments,
      });

      const mockSupabase = {
        from: jest.fn((table) => {
          if (table === "progress_entries") {
            return { select: mockSelectProgress };
          }

          if (table === "daily_activity_fulfillments") {
            return { select: mockSelectFulfillments };
          }

          throw new Error("Unexpected table");
        }),
      };

      const result = await getFulfillmentsByDate(
        mockSupabase as any,
        fakeUserId,
        fakeDate
      );

      expect(result).toEqual(fakeFulfillments);
      expect(mockSupabase.from).toHaveBeenCalledWith("progress_entries");
      expect(mockSupabase.from).toHaveBeenCalledWith(
        "daily_activity_fulfillments"
      );
    });
  });
});
