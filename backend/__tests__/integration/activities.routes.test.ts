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
    it("returns 200 and all activities create by user", async () => {
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

      
    });
    it("returns 200 and an empty array when the user has no activities", async () => {
      (getActivities as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
      .get(`/api/${fakeChallengeId}/activities`)
      .set("Authorization", "Bearer any-fake-token")
      .expect(200)

      expect(response.body).toEqual([])
      expect(getActivities).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeChallengeId
      )
    });
    
    it("returns 401 if no token is provided", async () => {

      const response = await request(app)
      .get(`/api/${fakeChallengeId}/activities`)
      .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 404 if challenge id is no provided", async () => {

      const response = await request(app)
      .get(`/api/activities`)
      .set("Authorization", "Bearer any-fake-token")
      .expect(404)


    });
    it("returns 400 when challenge id is invalid", async () => {

      const response = await request(app)
      .get(`/api/@/activities`)
      .set("Authorization", "Bearer any-fake-token")
      .expect(400)


      expect(response.body.error).toEqual("Invalid challenge id")




    });
    it("returns 500 when if an unexpected server error occurs", async () => {

      (getActivities as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch activities")
      );


      const response = await request(app)
      .get(`/api/${fakeChallengeId}/activities`)
      .set("Authorization", "Bearer any-fake-token")
      .expect(500)

      expect(response.body.error).toBe("Failed to fetch activities");

    });
    
    });

});

