import request from "supertest";
import app from "../../src/server";
import { supabase } from "../../src/services/supabaseClient";
import { postFulfillActivity } from "../../src/services/fulfillments.service";

jest.mock("../../src/services/fulfillments.service");
jest.mock("../../src/services/supabaseClient");

describe("Fulfillments", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeActivityId = 4;
  const fakeFulfillmentsId = 1;
  const fakeProgressEntryId = 3;

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

  describe("POST /api/fulfillments", () => {
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
        .post(`/api/fulfillments`)
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
  });
});
