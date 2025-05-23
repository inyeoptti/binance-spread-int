// utils/calcMetrics.js
import Binance from 'binance-api-node';
import { ATR, BollingerBands } from 'technicalindicators';

// 환경변수가 로드된 상태라고 가정
const client = Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});

const ATR_PERIOD       = 14;
const BB_PERIOD        = 20;
const BB_STD_DEV       = 2;
const ATR_MULT_STOP    = 2;
const ATR_MULT_PROFIT  = 6;
const DAILY_STOP       = 2;    // %
const DAILY_TARGET     = 6;    // %
const RISK_PER_TRADE   = 0.01; // 1%
const MAX_LEVERAGE     = 20;   // 상한

export async function calcMetrics(symbol, interval) {
  const limit = Math.max(ATR_PERIOD + 1, BB_PERIOD);
  const bars  = await client.candles({ symbol, interval, limit });

  const highs  = bars.map(b => +b.high);
  const lows   = bars.map(b => +b.low);
  const closes = bars.map(b => +b.close);
  const lastC  = closes[closes.length - 1];

  // ATR 계산
  const atrs    = ATR.calculate({ high: highs, low: lows, close: closes, period: ATR_PERIOD });
  const atr     = atrs[atrs.length - 1];
  const atrPct  = (atr / lastC) * 100;

  // Bollinger Band Width 계산
  const bbSeries   = BollingerBands.calculate({ period: BB_PERIOD, values: closes, stdDev: BB_STD_DEV });
  const bb         = bbSeries[bbSeries.length - 1];
  const bbWidthPct = ((bb.upper - bb.lower) / bb.middle) * 100;

  // per-trade 손절·익절
  const slPct = atrPct * ATR_MULT_STOP;
  const tpPct = atrPct * ATR_MULT_PROFIT;

  // 일간 손익비
  const dailyRR = DAILY_TARGET / DAILY_STOP;

  // 레버리지 계산
  const rawLev   = RISK_PER_TRADE / (atrPct / 100);
  const leverage = Math.min(rawLev, MAX_LEVERAGE);

  // 기대값 및 필요 횟수
  const evTrade   = 0.5 * tpPct - 0.5 * slPct;
  const estTrades = DAILY_TARGET / evTrade;

  // Kelly
  const kelly = (0.5 * dailyRR - 0.5) / dailyRR;

  return {
    symbol,
    interval,
    lastClose:   +lastC.toFixed(4),
    atr:         +atr.toFixed(4),
    atrPct:      +atrPct.toFixed(2),
    bbWidthPct:  +bbWidthPct.toFixed(2),
    slPct:       +slPct.toFixed(2),
    tpPct:       +tpPct.toFixed(2),
    dailyStop:   DAILY_STOP,
    dailyTarget: DAILY_TARGET,
    dailyRR:     +dailyRR.toFixed(2),
    rawLeverage: +rawLev.toFixed(2),
    leverage:    +leverage.toFixed(2),
    evTrade:     +evTrade.toFixed(2),
    estTrades:   +estTrades.toFixed(1),
    kelly:       +kelly.toFixed(2),
  };
}
