import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

export const app = express();

const extraOrigins = (process.env.CORS_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Sin origin (curl, apps nativas) o localhost en cualquier puerto (Vite puede cambiar de puerto en dev)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || extraOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('No permitido por CORS'));
  },
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);
