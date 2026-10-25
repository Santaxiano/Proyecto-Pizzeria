import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);



export default app;
