// cbBTC minute-bar trading bot for make.fun's bars-replay race.
//
// Strategy (long only, one position, sized at 50% of equity):
// Deep-Zone First Bounce. On a heavy downtrend day, ordinary
// dip-buying gets run over mid-fall: the fall is a slow grind, so
// short-window drop measures arm in the middle of the waterfall,
// hours before the real low. The one big long window in such a
// tape is the V-bounce off the exhaustion low. So this bot keys on
// depth, not speed: it arms only when price is at least DEPTH_BPS
// below the day's running high, and fires only when the bounce is
// visibly underway — price at least OFFLOW_BPS above the last
// hour's low with two consecutive upticks. Exit on the bounce
// target, a hard stop, a trailing stop once the bounce runs, or a
// long time stop. A long cooldown spaces the shots out. On a day
// that never falls deep, the bot simply never trades.
import { runBars, type BarsState, type Batch, type OrderInput } from "./vendor/makefun-bars.ts";

const SYMBOL = "CBBTC";
const DEPTH_BPS = 400;
const LOW_WIN = 60;
const OFFLOW_BPS = 30;
const TAKE_BPS = 90;
const STOP_BPS = 50;
const TRAIL_AT_BPS = 45;
const TRAIL_BPS = 30;
const MAX_HOLD = 120;
const SIZE_PCT = 50n;
const COOLDOWN = 240;
const MAX_SLIP = 150;
const WARMUP = 130;

const closes: number[] = [];
let dayHigh = 0;
let peak = 0;
let cool = 0;
let barsIn = 0;
let entryPx = 0;

function onBatch(state: BarsState, batch: Batch): OrderInput[] | null {
  const bar = batch.bars.find((b) => b.symbol === SYMBOL);
  if (!bar) return null;
  const price = Number(bar.c);
  closes.push(price);
  if (price > dayHigh) dayHigh = price;
  if (cool > 0) cool -= 1;
  if (state.warmingUp || closes.length < WARMUP) return null;

  const held = state.positions.get(SYMBOL);
  if (held && held.qty > 0n) {
    if (price > peak) peak = price;
    barsIn += 1;
    if (entryPx === 0) entryPx = price;
    const gainBps = entryPx > 0 ? (price / entryPx - 1) * 10000 : 0;
    const take = gainBps >= TAKE_BPS;
    const stop = gainBps <= -STOP_BPS;
    const trail = gainBps > TRAIL_AT_BPS && price < peak * (1 - TRAIL_BPS / 10000);
    const timed = barsIn >= MAX_HOLD;
    if (take || stop || trail || timed) {
      peak = 0;
      barsIn = 0;
      entryPx = 0;
      cool = COOLDOWN;
      return [{ side: "sell", symbol: SYMBOL, qty: held.qty.toString(), max_slippage_bps: MAX_SLIP }];
    }
    return null;
  }

  if (cool > 0) return null;
  const n = closes.length;
  const depthBps = (price / dayHigh - 1) * 10000;
  if (depthBps > -DEPTH_BPS) return null;
  let lowWin = Infinity;
  for (let i = n - LOW_WIN; i < n; i++) if (closes[i] < lowWin) lowWin = closes[i];
  const offLowBps = (price / lowWin - 1) * 10000;
  const twoUpticks = price > closes[n - 2] && closes[n - 2] > closes[n - 3];
  if (offLowBps >= OFFLOW_BPS && twoUpticks) {
    let amount = (state.equity * SIZE_PCT) / 100n;
    const room = state.weightRoom(SYMBOL);
    if (room < amount) amount = room;
    if (state.cash < amount) amount = state.cash;
    // Thin-pool guard: if this size would move the price more than
    // ~14 bps against us, scale down toward a ~10 bps impact instead
    // of paying for size the pool cannot absorb.
    const imp = state.impactBps(SYMBOL, amount);
    if (imp !== null && imp > 14n) {
      amount = (amount * 10n) / imp;
      if (state.cash < amount) amount = state.cash;
    }
    if (amount >= 1_000_000n) {
      peak = price;
      barsIn = 0;
      entryPx = 0;
      return [{ side: "buy", symbol: SYMBOL, notional_quote_units: amount.toString(), max_slippage_bps: MAX_SLIP }];
    }
  }
  return null;
}

runBars({ onBatch });
