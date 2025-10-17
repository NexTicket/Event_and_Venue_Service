import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import venueRoutes  from './routes/venue.routes';
import tenantRoutes from './routes/tenant.routes';
import eventRoutes  from './routes/events.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

<<<<<<< HEAD
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('📨 Headers:', req.headers);
  next();
});

=======
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
/* ───────────── body-parsers ─────────────
   Skip multipart/form-data requests – let multer handle them */
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    console.log('🔄 Skipping body parsing for multipart request:', req.method, req.url);
    return next();
  }
  
  // Apply JSON parser for non-multipart requests
  express.json({ limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return next();
  }
  
  // Apply URL-encoded parser for non-multipart requests
  express.urlencoded({ limit: '50mb', extended: true })(req, res, next);
});

/* ───────────── routes ───────────── */
app.get('/', (_req, res) => res.send('EVMS API Running 🚀'));

app.use('/api', venueRoutes);   // includes /venues/:id/image
app.use('/api', tenantRoutes);  // tenant management routes
app.use('/api', eventRoutes);

/* ───────────── server ───────────── */
const PORT = process.env.PORT || 8000;

export default app;

if (process.env.NODE_ENV !== 'test') {
<<<<<<< HEAD
  const server = app.listen(PORT, () => {
    console.log(`🚀  EVMS server running on port ${PORT}`);
  });
  
  // Increase server timeout to handle large requests
  server.timeout = 120000; // 120 seconds
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
=======
  app.listen(PORT, () => {
    console.log(`🚀  EVMS server running on port ${PORT}`);
  });
>>>>>>> b60000d1e117960e27f361965b188da2d1ef361b
}
