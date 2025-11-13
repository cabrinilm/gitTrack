import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './services/supabaseClient'; // sem .js

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json()); // obrigatório para POST/PUT com JSON

// === ROTAS ===
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'GitTrack API - Backend running!' });
});

// Exemplo de rota com Supabase
app.get('/health', async (req: Request, res: Response) => {
  const { data, error } = await supabase.from('health').select('*').limit(1);
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ status: 'ok', data });
});

// === SERVIDOR ===
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

// Export para testes
export default app; // pode manter, funciona com esModuleInterop: true
