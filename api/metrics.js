// api/metrics.js
import { config } from 'dotenv';
import Binance from 'binance-api-node';
import { ATR, BollingerBands } from 'technicalindicators';
import { calcMetrics } from '../utils/calcMetrics.js';

config();
const client = Binance({ apiKey: process.env.BINANCE_API_KEY, apiSecret: process.env.BINANCE_API_SECRET });

const ATR_PERIOD = 14;
const BB_PERIOD  = 20;
const BB_STD_DEV = 2;
const ATR_MULT_STOP   = 2;
const ATR_MULT_PROFIT = 6;
const DAILY_STOP      = 2;
const DAILY_TARGET    = 6;
const RISK_PER_TRADE  = 0.01;
const MAX_LEVERAGE    = 20;

export default async function handler(req, res) {
  const symbol   = req.query.symbol || 'BTCUSDT';
  const interval = req.query.interval || '5m';
  try {
    // calcMetrics 함수를 여기에 넣거나 import
    const data = await calcMetrics(symbol, interval);
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
