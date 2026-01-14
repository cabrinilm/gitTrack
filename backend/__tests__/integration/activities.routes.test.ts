import request from "supertest";
import app from "../../src/server";
import {
  Activities,
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
} from "../../src/services/activities.service";
import { supabase } from "../../src/services/supabaseClient";

jest.mock("../../src/services/activities.service");
jest.mock("../../src/services/supabaseClient");

describe("Activities", () => {
  const fakeUserId = "123e4567-e89b-12d3-a456-426614174000";
  const fakeChallengeId = 2;
  const fakeActivityId = 4;

  beforeEach(() => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: fakeUserId } },
      error: null,
    });
  });

  describe("GET /api/:challengeId/activities", () => {
    it("returns 200 and all activities create by user", async () => {
      const listActivities: Activities[] = [
        {
          user_id: fakeUserId,
          id: 1,
          challenge_id: fakeChallengeId,
          name: "Gym workout",
          duration_minutes: 60,
          order_num: 1,
        },
        {
          user_id: fakeUserId,
          id: 2,
          challenge_id: fakeChallengeId,
          name: "Sleep",
          duration_minutes: 480,
          order_num: 2,
        },
        {
          user_id: fakeUserId,
          id: 3,
          challenge_id: fakeChallengeId,
          name: "Health meal",
          duration_minutes: 20,
          order_num: 3,
        },
      ];

      (getActivities as jest.Mock).mockResolvedValue(listActivities);

      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities`)
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
        .get(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual([]);
      expect(getActivities).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeChallengeId
      );
    });

    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 if challenge id is no provided", async () => {
      const response = await request(app)
        .get(`/api/challenges/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);
    });
    it("returns 400 when challenge id is invalid", async () => {
      const response = await request(app)
        .get(`/api/challenges/@/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);

      expect(response.body.error).toEqual("Invalid challenge id");
    });
    it("returns 500 when if an unexpected server error occurs", async () => {
      (getActivities as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch activities")
      );

      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to fetch activities");
    });
  });
  describe("GET /api/:challengeId/activities/:activityId", () => {
    it("returns 200 and the activity select by user", async () => {
      const activity: Activities = {
        user_id: fakeUserId,
        id: 1,
        challenge_id: fakeChallengeId,
        name: "Gym workout",
        duration_minutes: 60,
        order_num: 1,
      };

      (getActivityById as jest.Mock).mockResolvedValue(activity);

      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(200);

      expect(response.body).toEqual(activity);
      expect(getActivityById).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeChallengeId,
        fakeActivityId
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 if challenge id is no provided", async () => {
      const response = await request(app)
        .get(`/api/challenges/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);
    });
    it("returns 404 when activity id is provided without challenge id", async () => {
      const response = await request(app)
        .get(`/api/challenges/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(404);
    });
    it("returns 400 when challenge id is invalid", async () => {
      const response = await request(app)
        .get(`/api/challenges/@/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);

      expect(response.body.error).toEqual("Invalid challenge id");
    });
    it("returns 400 when activity id is invalid", async () => {
      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities/abc`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(400);

      expect(response.body.error).toEqual("Invalid activity id");
    });
    it("returns 500 when if an unexpected server error occurs", async () => {
      (getActivityById as jest.Mock).mockRejectedValue(
        new Error("Failed to fetch activities")
      );

      const response = await request(app)
        .get(`/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .expect(500);

      expect(response.body.error).toBe("Failed to fetch activity");
    });
  });
  describe("POST /api/challenges/:challengeId/activities", () => {
    const newActivity = {
      name: "Gym workout",
      duration_minutes: 60,
    };

    it("returns 201 and the activity created", async () => {
      const activity: Activities = {
        ...newActivity,
        user_id: fakeUserId,
        id: fakeActivityId,
        challenge_id: fakeChallengeId,
        order_num: 1,
      };

      (createActivity as jest.Mock).mockResolvedValue(activity);

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(201);

      expect(response.body).toEqual(activity);
      expect(createActivity).toHaveBeenCalledWith(
        expect.any(Object),
        fakeUserId,
        fakeChallengeId,
        newActivity
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .post(`/api/challenges/:challengeId/activities`)
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 400 when activity name exceeds maximum length", async () => {
      const newActivity = {
        name: "Gym workout,Gym workout,Gym workout,Gym workout",
        duration_minutes: 60,
      };

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });
    it("returns 400 when activity duration is less than 1", async () => {
      const newActivity = {
        name: "Gym workout",
        duration_minutes: 0,
      };

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });

    it("returns 400 when activity duration exceeds maximum length", async () => {
      const newActivity = {
        name: "Gym workout",
        duration_minutes: 1441,
      };

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });
    it("returns 500 when if an unexpected server error occurs", async () => {
      (createActivity as jest.Mock).mockRejectedValue(
        new Error("Failed to create new activity")
      );

      const response = await request(app)
        .post(`/api/challenges/${fakeChallengeId}/activities`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(500);

      expect(response.body.error).toBe("Failed to create new activity");
    });
  });
  describe("PATCH /api/challenges/:challengeId/activities/:activityId", () => {
    const update = {
      name: "Gym workout",
      duration_minutes: 60,
    };
    it("returns 200 and the updated activity when update is successful", async () => {
      const expectedUpdatedActivity: Activities = {
        ...update,
        id: fakeActivityId,
        user_id: fakeUserId,
        challenge_id: fakeChallengeId,
        order_num: 1,
      };

      (updateActivity as jest.Mock).mockResolvedValue(expectedUpdatedActivity);

      const response = await request(app)
        .patch(
          `/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`
        )
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(200);

      expect(response.body).toEqual(expectedUpdatedActivity);
      expect(updateActivity).toHaveBeenCalledWith(
        expect.anything(),
        fakeUserId,
        Number(fakeChallengeId),
        fakeActivityId,
        update
      );
    });
    it("returns 401 if no token is provided", async () => {
      const response = await request(app)
        .patch(
          `/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`
        )
        .expect(401);

      expect(response.body.error).toEqual("No token provided");
    });
    it("returns 404 if challenge id is no provided", async () => {
      const response = await request(app)
        .patch(`/api/challenges/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(404);
    });
    it("returns 404 if activity id is no provided", async () => {
      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}/activities/`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(404);
    });
    it("returns 400 if activity id is invalid", async () => {
      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}/activities/abc`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(400);
    });
    it("returns 400 if challenge id is invalid", async () => {
      const response = await request(app)
        .patch(`/api/challenges/a1/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(400);
    });
    it("returns 400 when activity name exceeds maximum length", async () => {
      const newActivity = {
        name: "Gym workout,Gym workout,Gym workout,Gym workout",
        duration_minutes: 60,
      };

      const response = await request(app)
        .patch(
          `/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`
        )
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });
    it("returns 400 when activity duration is less than 1", async () => {
      const newActivity = {
        name: "Gym workout",
        duration_minutes: 0,
      };

      const response = await request(app)
        .patch(
          `/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`
        )
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });
    it("returns 400 when activity duration exceeds maximum length", async () => {
      const newActivity = {
        name: "Gym workout",
        duration_minutes: 1441,
      };

      const response = await request(app)
        .patch(`/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(newActivity)
        .expect(400);

      expect(response.body.error).toEqual("Invalid request body");
    });
    it("returns 500 when an unexpected server error occurs", async () => {
      (updateActivity as jest.Mock).mockRejectedValue(
        new Error("Failed to update activity")
      );

      const response = await request(app)
      .patch(`/api/challenges/${fakeChallengeId}/activities/${fakeActivityId}`)
        .set("Authorization", "Bearer any-fake-token")
        .send(update)
        .expect(500);
      
        expect(response.body.error).toBe("Failed to update activity");

    });
  });
});
