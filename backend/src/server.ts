import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './services/supabaseClient'; 
import { getMyProfile } from './controllers/profile.controller';

dotenv.config();

const app = express();

 const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;


app.use(cors());
app.use(express.json()); 


app.get("/api/profile", getMyProfile)

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});


export default app; 





