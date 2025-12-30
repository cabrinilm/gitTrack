import express, { Request, Response, NextFunction } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { getMyProfile, updateMyProfile } from './controllers/profile.controller';
import { authMiddleware } from './middleware/auth';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/api", authMiddleware);

app.get("/api/profile", getMyProfile)
app.post("/api/profile", updateMyProfile)

export default app; 



if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}







