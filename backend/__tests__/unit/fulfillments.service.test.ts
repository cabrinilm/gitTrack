import {
  postFulfillActivity,
  getFulfillmentsByDate,
  getHeatmapData,
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

  describe("POST /api/progress/fulfillments", () => {
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
  describe("GET /api/progress/:date/fulfillments", () => {
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
    it("returns an empty array when no fulfillments exist for the date", async () => {
      const fakeEmptyFulfillments: any[] = [];

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
        data: fakeEmptyFulfillments,
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

      expect(result).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith("progress_entries");
      expect(mockSupabase.from).toHaveBeenCalledWith(
        "daily_activity_fulfillments"
      );
    });
  });
  describe("GET /api/progress/heatmap", () => {
    it("returns heatmap data for all days of a non-leap year, filling missing days with 0", async () => {
      const fakeHeatmapData = [
        { date: "2025-01-01", count: 3 },
        { date: "2025-03-19", count: 1 },
      ];

      const mockRpc = jest.fn().mockResolvedValue({
        data: fakeHeatmapData,
        error: null,
      });

      const mockSupabase = { rpc: mockRpc };

      const result = await getHeatmapData(
        mockSupabase as any,
        fakeUserId,
        2025
      );

      expect(mockRpc).toHaveBeenCalledWith("get_heatmap_data", {
        p_user_id: fakeUserId,
        p_start_date: "2025-01-01",
        p_end_date: "2025-12-31",
      });

      expect(result.find((d) => d.date === "2025-01-01")?.count).toBe(3);
      expect(result.find((d) => d.date === "2025-03-19")?.count).toBe(1);

      expect(result.find((d) => d.date === "2025-01-02")?.count).toBe(0);

      expect(result.length).toBe(365);
    });

    it("returns heatmap data correctly for a leap year", async () => {
      const fakeHeatmapData = [{ date: "2024-02-29", count: 7 }];

      const mockRpc = jest.fn().mockResolvedValue({
        data: fakeHeatmapData,
        error: null,
      });

      const mockSupabase = { rpc: mockRpc };

      const result = await getHeatmapData(
        mockSupabase as any,
        fakeUserId,
        2024
      );

      expect(result.find((d) => d.date === "2024-02-29")?.count).toBe(7);

      expect(result.length).toBe(366);
    });

    it("throws an error when RPC returns an error", async () => {
      const mockRpc = jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB exploded" },
      });

      const mockSupabase = { rpc: mockRpc };

      await expect(
        getHeatmapData(mockSupabase as any, fakeUserId, 2025)
      ).rejects.toThrow("Failed to fetch heatmap data");
    });
  });
});
