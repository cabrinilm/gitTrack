import request from "supertest";
import app from "../../src/server";
import { supabase } from "../../src/services/supabaseClient";
import {
  getFulfillmentsByDate,
  getHeatmapData,
  postFulfillActivity,
} from "../../src/services/fulfillments.service";
import type { Fulfillments } from "../../src/types/fulfillments.type";

jest.mock("../../src/services/fulfillments.service");
jest.mock("../../src/services/supabaseClient");

describe("Fulfillments", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeActivityId = 4;
  const fakeFulfillmentsId = 1;
  const fakeProgressEntryId = 3;
  const fakeDate = "2025-03-20";

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

  const newActivity = {
    name: "Gym workout",
    duration_minutes: 60,
  };

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });
  });

  describe("POST /api/progress/fulfillments", () => {
    it("retuns 201 and the fulfillment created", async () => {
      const returnFulfillments = {
        success: true,
        fulfillment: {
          id: fakeFulfillmentsId,
          progress_entry_id: fakeProgressEntryId,
          activity_id: fakeActivityId,
          activity_name: newActivity.name,
          planned_duration_minutes: newActivity.duration_minutes,
          fulfilled_at: new Date().toISOString(),
        },
        progressEntryId: fakeProgressEntryId,
      };

      (postFulfillActivity as jest.Mock).mockResolvedValue(returnFulfillments);

      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: fakeActivityId })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        fulfillment: {
          id: fakeFulfillmentsId,
          activity_id: fakeActivityId,
          progress_entry_id: fakeProgressEntryId,
          activity_name: newActivity.name,
          planned_duration_minutes: newActivity.duration_minutes,
          fulfilled_at: expect.any(String),
        },
        progressEntryId: fakeProgressEntryId,
      });
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get("/api/progress/active-challenge")
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 if no activity id is provided", async () => {
      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: null })
        .expect(400);

      expect(response.body.error).toEqual(
        "activityId must be a positive integer"
      );
    });
    it("returns 400 if  activity id is a negative number", async () => {
      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: -1 })
        .expect(400);

      expect(response.body.error).toEqual(
        "activityId must be a positive integer"
      );
    });
    it("returns 400 if  activity id is zero", async () => {
      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: 0 })
        .expect(400);

      expect(response.body.error).toEqual(
        "activityId must be a positive integer"
      );
    });
    it("returns 400 if  activity id is a string", async () => {
      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: "abc" })
        .expect(400);

      expect(response.body.error).toEqual(
        "activityId must be a positive integer"
      );
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (postFulfillActivity as jest.Mock).mockRejectedValue(
        new Error("Failed to fulfill activity")
      );

      const response = await request(app)
        .post(`/api/progress/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .send({ activityId: fakeActivityId })
        .expect(500);

      expect(response.body.error).toBe("Failed to fulfill activity");
    });
  });
  describe("GET /api/progress/:date/fulfillments", () => {
    it("returns 200 and and the fulfillments for the selected date", async () => {
      (getFulfillmentsByDate as jest.Mock).mockResolvedValue(fakeFulfillments);

      const response = await request(app)
        .get(`/api/progress/${fakeDate}/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body.fulfillments).toEqual(fakeFulfillments);
      expect(getFulfillmentsByDate).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeDate
      );
    });
    it("returns 200 and empty array when no fulfillments exist for the date", async () => {
      (getFulfillmentsByDate as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/progress/${fakeDate}/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body.fulfillments).toEqual([]);

      expect(getFulfillmentsByDate).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeDate
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get(`/api/progress/${fakeDate}/fulfillments`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 404 when date is missing", async () => {
      const response = await request(app)
        .get("/api/progress/fulfillments")
        .set("Authorization", "Bearer any-fake-token")
        .expect(404);
    });
    it("returns 400 when date format is invalid", async () => {
      const response = await request(app)
        .get("/api/progress/invalid-date/fulfillments")
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);

      expect(response.body.error).toBe("Invalid date format. Use YYYY-MM-DD");
    });
    it("returns 500 if an unexpected server error occurs", async () => {
      (getFulfillmentsByDate as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch fulfillments for the date")
      );

      const response = await request(app)
        .get(`/api/progress/${fakeDate}/fulfillments`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe(
        "Failed to fetch fulfillments for the date"
      );
    });
    describe("GET /api/progress/heatmap", () => {
      const fakeHeatmapData = [
        { date: "2025-01-01", count: 3 },
        { date: "2025-03-19", count: 1 },
      ];

      it("returns 200 and the all activities marked as completed between a year", async () => {
        (getHeatmapData as jest.Mock).mockResolvedValue(fakeHeatmapData);

        const response = await request(app)
          .get("/api/progress/heatmap")
          .set("Authorization", "Bearer any-fake-token")
          .expect(200);

        expect(response.body).toEqual(fakeHeatmapData);
        expect(getHeatmapData).toHaveBeenCalledTimes(1);
        expect(getHeatmapData).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          undefined
        );
      });
      it("returns 200 and heatmap data for a specific year", async () => {
        (getHeatmapData as jest.Mock).mockResolvedValue(fakeHeatmapData);

        await request(app)
          .get("/api/progress/heatmap?year=2025")
          .set("Authorization", "Bearer any-fake-token")
          .expect(200);

        expect(getHeatmapData).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          2025
        );
      });

      it("returns 401 if no token is provided", async () => {
        const response = await request(app)
          .get("/api/progress/heatmap")
          .expect(401);

        expect(response.body.error).toEqual("No token provided");
      });
      it("returns 400 if year is not a valid number", async () => {
        const response = await request(app)
          .get("/api/progress/heatmap?year=abc")
          .set("Authorization", "Bearer any-fake-token")
          .expect(400);

        expect(response.body.error).toEqual("Invalid year");

        expect(getHeatmapData).not.toHaveBeenCalled();
      });
      it("returns 500 when the service throws an error", async () => {
        (getHeatmapData as jest.Mock).mockRejectedValue(
          new Error("Failed to fetch heatmap data")
        );

        const response = await request(app)
          .get("/api/progress/heatmap")
          .set("Authorization", "Bearer any-fake-token")
          .expect(500);

        expect(response.body.error).toEqual("Failed to load the heat map");
      });
    });
  });
});
