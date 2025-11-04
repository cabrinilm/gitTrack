import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

// middlewares

const app = express();
const PORT = process.env.PORT ||  3001;


// routes

app.get('/', (req, res) => {
    res.json({ message : 'GitTrack API - Backend running!'});
});

app.listen(PORT, () => {
    console.log(`Backend running http://localhost:${PORT}`);
});