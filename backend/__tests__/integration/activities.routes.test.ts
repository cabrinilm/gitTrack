import request from "supertest"
import app from "../../src/server";
import { getActivities } from "../../src/services/activities.service";
import { supabase } from "../../src/services/supabaseClient";


jest.mock("../../src/services/activities.service");
jest.mock("../../src/services/supabaseClient");


describe("Activities", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });
  });

  describe("GET /api/activities", () => {
    it("return 200 and all activities create by user", async () => {
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

      (getActivities as jest.Mock).mockResolvedValue(listActivities);

      const response = await request(app)
        .get(`/api/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual(listActivities);
      expect(getActivities).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeChallengeId
      );

      
    })

});












});
