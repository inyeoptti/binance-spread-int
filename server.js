// server.js
import 'dotenv/config';
import express from 'express';
import { calcMetrics } from './utils/calcMetrics.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/metrics', async (req, res) => {
  const symbol   = req.query.symbol   || 'BTCUSDT';
  const interval = req.query.interval || '5m';
  try {
    const data = await calcMetrics(symbol, interval);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Local API listening on http://localhost:${PORT}`));