import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { getMyProfile, updateMyProfile } from './controllers/profile.controller';
import { authMiddleware } from './middleware/auth';
import { createMyChallenge, deleteMyChallenge, getMyChallengeById, getMyChallenges, updateMyChallenge } from "./controllers/challenges.controller";
import { createMyActivity, getMyActivities, getMyActivityById, updateMyActivity } from "./controllers/activities.controller";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/api", authMiddleware);

app.get("/api/profile", getMyProfile);
app.patch("/api/profile", updateMyProfile);


app.get("/api/challenges", getMyChallenges);
app.get("/api/challenges/:challengeId", getMyChallengeById);
app.post("/api/challenges", createMyChallenge);
app.patch("/api/challenges/:challengeId", updateMyChallenge);
app.delete("/api/challenges/:challengeId", deleteMyChallenge);


app.get("/api/challenges/:challengeId/activities", getMyActivities);
app.get("/api/challenges/:challengeId/activities/:activityId", getMyActivityById);
app.post("/api/challenges/:challengeId/activities", createMyActivity);
app.patch("/api/challenges/:challengeId/activities/:activityId", updateMyActivity);



export default app; 



if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}







