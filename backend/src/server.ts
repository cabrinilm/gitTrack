import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './services/supabaseClient'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json()); 


app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'GitTrack API - Backend running!' });
});

app.get('/health', async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('health').select('*').limit(1);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ status: 'ok', data });
});


app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});


export default app; 





