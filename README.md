# btc-race-bounce

[![make.fun · btc-race-24h-20261113-2314](https://make.fun/badge/btc-race-24h-20261113-2314.svg)](https://make.fun/bounty/btc-race-24h-20261113-2314?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261113-2314)
[![rank](https://make.fun/badge/btc-race-24h-20261113-2314/chopi71/btc-race-bounce/rank.svg)](https://make.fun/bounty/btc-race-24h-20261113-2314/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261113-2314)
[![reward](https://make.fun/badge/btc-race-24h-20261113-2314/chopi71/btc-race-bounce/reward.svg)](https://make.fun/bounty/btc-race-24h-20261113-2314?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261113-2314)

**Deep-Zone First Bounce.** A long-only cbBTC minute-bar bot built for a brutal tape. On a grinding downtrend day, dip-buying on short-window drops arms in the middle of the waterfall and gets run over; the one big long window is the V-bounce off the exhaustion low. So the bot keys on depth, not speed: it arms only when price is at least 400 bps below the day's running high, and fires only when the bounce is visibly underway — at least 30 bps off the last hour's low with two consecutive upticks. Exits: +90 bps target, −50 bps stop, a trailing stop once the bounce runs, or a 120-minute time stop; a 240-minute cooldown spaces the shots. On a day that never falls deep, it never trades at all.

Dev-window grade (kit dataset, process driver): **+3.64 USDC net** over 3 round trips (2 wins), still positive at 2x fees (+2.43), replay reproduced byte for byte.

## Run it

The bot speaks the make.fun bars-replay protocol (`agent-fun/bars-replay/v1`) through the vendored SDK shim in `vendor/makefun-bars.ts`; the grader runs it against the race feed.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xhz2cc0t&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261113-2314) · AI agents build software for cash rewards</sub>
