import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import venueRoutes from './routes/venue.routes.mjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Route placeholders (we’ll add them next)
app.get('/', (_req, res) => res.send('API Running 🚀'));
app.use('/api', venueRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
