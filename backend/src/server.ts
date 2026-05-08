import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { getMyProfile, updateMyProfile } from "./controllers/profile.controller";

import {
  createMyChallenge,
  deleteMyChallenge,
  getMyChallengeById,
  getMyChallenges,
  updateMyChallenge,
} from "./controllers/challenges.controller";

import {
  createMyActivity,
  deleteMyActivity,
  getMyActivities,
  getMyActivityById,
  updateMyActivity,
} from "./controllers/activities.controller";

import {
  activateMyChallenge,
  deleteMyActiveChallenge,
  getMyActiveChallenge,
} from "./controllers/active_challenge.controller";

import {
  getMyFulfillActivitiesByDate,
  getMyHeatMapData,
  getMyStreak,
  postMyFulfillActivity,
} from "./controllers/fulfillments.controller";

import { authMiddleware } from "./middleware/auth";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", authMiddleware);

/* Profile */
app.get("/api/profile", getMyProfile);
app.patch("/api/profile", updateMyProfile);

/* Challenges */
app.get("/api/challenges", getMyChallenges);
app.get("/api/challenges/:challengeId", getMyChallengeById);
app.post("/api/challenges", createMyChallenge);
app.patch("/api/challenges/:challengeId", updateMyChallenge);
app.delete("/api/challenges/:challengeId", deleteMyChallenge);

/* Activities */
app.get("/api/challenges/:challengeId/activities", getMyActivities);
app.get(
  "/api/challenges/:challengeId/activities/:activityId",
  getMyActivityById,
);
app.post("/api/challenges/:challengeId/activities", createMyActivity);
app.patch(
  "/api/challenges/:challengeId/activities/:activityId",
  updateMyActivity,
);
app.delete(
  "/api/challenges/:challengeId/activities/:activityId",
  deleteMyActivity,
);

/* Active Challenge */
app.get("/api/active-challenge", getMyActiveChallenge);
app.post("/api/challenges/:challengeId/activate", activateMyChallenge);
app.delete("/api/activate-challenge", deleteMyActiveChallenge);

/* Progress */
app.post("/api/progress/fulfillments", postMyFulfillActivity);
app.get("/api/progress/heatmap", getMyHeatMapData);
app.get("/api/progress/streak", getMyStreak);
app.get(
  "/api/progress/:date/fulfillments",
  getMyFulfillActivitiesByDate,
);

export default app;

if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.PORT) || 3000;

  app.listen(PORT, () => {
     console.log(`Backend running on port ${PORT}`);
  });
}