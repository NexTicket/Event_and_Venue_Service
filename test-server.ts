import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.send('Minimal EVMS API 🚀'));

app.get('/api/test', (_req, res) => {
  res.json({ status: 'Test endpoint working!', timestamp: new Date().toISOString() });
});

app.post('/api/test', (req, res) => {
  res.json({ 
    message: 'POST test working!', 
    body: req.body,
    timestamp: new Date().toISOString() 
  });
});

const PORT = 4001; // Use different port to avoid conflict

app.listen(PORT, () => {
  console.log(`🧪 Minimal test server running on port ${PORT}`);
});
