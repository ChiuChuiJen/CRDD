import { Coin, MarketEvent, ImpactLevel } from '../data/parser';

export interface LuckBet {
  id: string;
  amount: number;
  option: 'small' | 'large' | 'zero_five';
  timestamp: number;
  odds: number;
}

export interface LuckEvent {
  id: string;
  targetType: 'index' | 'coin' | 'etf' | 'leveraged';
  targetId: string;
  targetDigit: 'units' | 'tens' | 'hundreds' | 'thousands' | 'ten_thousands' | 'decimal_1' | 'decimal_2' | 'decimal_3' | 'decimal_4';
  listDate: number;
  stopTradingDate: number;
  settlementDate: number;
  delistDate: number;
  status: 'active' | 'settled' | 'delisted';
  bets: LuckBet[];
  settlementValue?: number;
  winningOption?: 'small' | 'large' | 'zero_five';
}

export interface SimulationState {
  currentTime: number;
  coins: Coin[];
  indexValue: number;
  indexHistory: { time: number, price: number }[];
  indexDailyHistory: { date: number, open: number, high: number, low: number, close: number }[];
  activeEvents: { event: MarketEvent, targetCoinId?: string, targetCategory?: string, impact: number, expiresAt: number }[];
  news: { time: number, text: string }[];
  top50Ids: string[];
  luckEvents: LuckEvent[];
  userBalance: number;
}

// Standard Normal variate using Box-Muller transform
function randn_bm() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Geometric Brownian Motion step (kept for reference, but we use advanced step now)
function gbmStep(S: number, mu: number, sigma: number, dt: number): number {
  const dW = Math.sqrt(dt) * randn_bm();
  const dS = mu * S * dt + sigma * S * dW;
  return S + dS;
}

export function getLuckEventSchedule(year: number, month: number) {
  const isFeb = month === 1;
  const events = [
    {
      list: new Date(year, month, 1, 2, 0).getTime(),
      stop: new Date(year, month, 7, 16, 0).getTime(),
      settle: new Date(year, month, 8, 20, 0).getTime(),
    },
    {
      list: new Date(year, month, 9, 2, 0).getTime(),
      stop: new Date(year, month, 15, 16, 0).getTime(),
      settle: new Date(year, month, 16, 20, 0).getTime(),
    },
    {
      list: new Date(year, month, 17, 2, 0).getTime(),
      stop: new Date(year, month, 23, 16, 0).getTime(),
      settle: new Date(year, month, 24, 20, 0).getTime(),
    },
    {
      list: new Date(year, month, 25, 2, 0).getTime(),
      stop: isFeb ? new Date(year, month, 27, 12, 0).getTime() : new Date(year, month, 29, 16, 0).getTime(),
      settle: isFeb ? new Date(year, month, 28, 20, 0).getTime() : new Date(year, month, 30, 20, 0).getTime(),
    }
  ];

  return events.map(e => ({
    ...e,
    delist: e.settle + 24 * 60 * 60 * 1000
  }));
}

export function calculateLuckOdds(targetValue: number, digitType: string): { small: number, large: number, zero_five: number } {
  let digit = 0;
  if (digitType === 'units') digit = Math.floor(targetValue) % 10;
  else if (digitType === 'tens') digit = Math.floor(targetValue / 10) % 10;
  else if (digitType === 'hundreds') digit = Math.floor(targetValue / 100) % 10;
  else if (digitType === 'thousands') digit = Math.floor(targetValue / 1000) % 10;
  else if (digitType === 'ten_thousands') digit = Math.floor(targetValue / 10000) % 10;
  else if (digitType === 'decimal_1') digit = Math.floor(targetValue * 10) % 10;
  else if (digitType === 'decimal_2') digit = Math.floor(targetValue * 100) % 10;
  else if (digitType === 'decimal_3') digit = Math.floor(targetValue * 1000) % 10;
  else if (digitType === 'decimal_4') digit = Math.floor(targetValue * 10000) % 10;

  // 數值接近5或0則5或0選項倍率最高 (Max 3x)
  // 1~4 (Small), 6~9 (Large), 5 or 0 (Zero/Five)
  // Distance to 0 or 5
  const distTo0 = Math.min(digit, 10 - digit);
  const distTo5 = Math.abs(digit - 5);
  const minDistTo05 = Math.min(distTo0, distTo5);

  let small = 1.5, large = 1.5, zero_five = 1.5;
  
  // minDistTo05:
  // 0 -> digit is 0 or 5
  // 1 -> digit is 1, 4, 6, 9
  // 2 -> digit is 2, 3, 7, 8
  
  if (minDistTo05 === 0) {
    zero_five = 3.0;
  } else if (minDistTo05 === 1) {
    zero_five = 2.5;
  } else {
    zero_five = 1.5;
  }

  if (digit >= 1 && digit <= 4) {
    small = 3.0 - (digit - 1) * 0.5; // 1->3.0, 2->2.5, 3->2.0, 4->1.5
    large = 1.5 + (digit - 1) * 0.5; // 1->1.5, 2->2.0, 3->2.5, 4->3.0
  } else if (digit >= 6 && digit <= 9) {
    large = 1.5 + (digit - 6) * 0.5; // 6->1.5, 7->2.0, 8->2.5, 9->3.0
    small = 3.0 - (digit - 6) * 0.5; // 6->3.0, 7->2.5, 8->2.0, 9->1.5
  } else {
    small = 1.5;
    large = 1.5;
  }

  return {
    small: Number(small.toFixed(2)),
    large: Number(large.toFixed(2)),
    zero_five: Number(zero_five.toFixed(2))
  };
}

export function initializeSimulation(coins: Coin[]): SimulationState {
  // Determine initial top 50 (only normal coins, no ETFs or Leveraged tokens)
  const eligibleCoins = coins.filter(c => !c.isETF && !c.isLeveraged);
  const sorted = [...eligibleCoins].sort((a, b) => b.volume30d - a.volume30d);
  const top50Ids = sorted.slice(0, 50).map(c => c.id);

  const now = Date.now();
  const initializedCoins = coins.map(c => ({
    ...c,
    dailyHistory: [{
      date: now,
      open: c.initialPrice,
      high: c.initialPrice,
      low: c.initialPrice,
      close: c.initialPrice
    }]
  }));

  const defaultETF: Coin = {
    id: 'TOP10',
    name: 'Top 10 Crypto Index ETF',
    symbol: 'TOP10',
    initialPrice: 100,
    price: 100,
    totalSupply: 10000000,
    marketCap: 1000000000,
    description: 'Tracks the top 10 cryptocurrencies by volume.',
    volume24h: 5000000,
    volume30d: 150000000,
    history: [{ time: now, price: 100 }],
    dailyHistory: [{ date: now, open: 100, high: 100, low: 100, close: 100 }],
    chipDistribution: { foreign: 40, institution: 40, largeHolder: 10, retail: 10 },
    circulation: { circulating: 100, staked: 0, locked: 0 },
    sentiment: 0,
    volatility: 0.02,
    drift: 0,
    variance: 0.0004,
    kappa: 2,
    theta: 0.0004,
    xi: 0.1,
    lambda: 1,
    muJ: 0,
    sigmaJ: 0.05,
    hurst: 0.5,
    lastNoise: 0,
    isETF: true,
    components: top50Ids.slice(0, 10)
  };

  initializedCoins.push(defaultETF);

  return {
    currentTime: now,
    coins: initializedCoins,
    indexValue: 10000,
    indexHistory: [{ time: now, price: 10000 }],
    indexDailyHistory: [{ date: now, open: 10000, high: 10000, low: 10000, close: 10000 }],
    activeEvents: [],
    news: [],
    top50Ids,
    luckEvents: [],
    userBalance: 100000 // Give user some initial balance
  };
}

export function tickSimulation(
  state: SimulationState, 
  eventsA: MarketEvent[], 
  eventsB: MarketEvent[], 
  eventsC: MarketEvent[],
  impacts: ImpactLevel[]
): SimulationState {
  const TICK_MS = 10 * 60 * 1000; // 10 minutes
  const dt = TICK_MS / (365 * 24 * 60 * 60 * 1000); // dt in years
  
  const newTime = state.currentTime + TICK_MS;
  const isNewDay = new Date(newTime).getDate() !== new Date(state.currentTime).getDate();
  
  let newEvents = [...state.activeEvents].filter(e => e.expiresAt > newTime);
  let newNews = [...state.news];
  let newLuckEvents = [...state.luckEvents];
  let newUserBalance = state.userBalance;

  // Manage Luck Events
  const d = new Date(newTime);
  const schedule = getLuckEventSchedule(d.getFullYear(), d.getMonth());
  
  for (const s of schedule) {
    const settleDateStr = new Date(s.settle).toISOString().slice(0, 10).replace(/-/g, '');
    const eventId = `CRLUCK-C-In-${settleDateStr}`;
    
    // Check if we need to list it
    if (newTime >= s.list && newTime < s.delist) {
      let existing = newLuckEvents.find(e => e.id === eventId);
      if (!existing) {
        existing = {
          id: eventId,
          targetType: 'index',
          targetId: 'index',
          targetDigit: 'units',
          listDate: s.list,
          stopTradingDate: s.stop,
          settlementDate: s.settle,
          delistDate: s.delist,
          status: 'active',
          bets: []
        };
        newLuckEvents.push(existing);
      }
    }
  }

  // Generate new events if it's a new day
  if (isNewDay) {
    const numEvents = Math.floor(Math.random() * 5); // 0 to 4 events
    for (let i = 0; i < numEvents; i++) {
      const randType = Math.random();
      let eventList: MarketEvent[];
      let isMarketWide = false;
      let isCategory = false;

      if (randType > 0.8) {
        eventList = eventsB;
        isMarketWide = true;
      } else if (randType > 0.5) {
        eventList = eventsC;
        isCategory = true;
      } else {
        eventList = eventsA;
      }

      const event = eventList[Math.floor(Math.random() * eventList.length)];
      
      // Determine impact
      const rand = Math.random();
      let cumulative = 0;
      let selectedImpact = impacts[0];
      for (const imp of impacts) {
        cumulative += imp.probability;
        if (rand <= cumulative) {
          selectedImpact = imp;
          break;
        }
      }

      let impactValue = 0;
      if (selectedImpact.isSymmetric) {
        const sign = Math.random() > 0.5 ? 1 : -1;
        impactValue = sign * (selectedImpact.min + Math.random() * (selectedImpact.max - selectedImpact.min));
      } else {
        impactValue = selectedImpact.min + Math.random() * (selectedImpact.max - selectedImpact.min);
      }

      let targetCoinId: string | undefined;
      let targetCategory: string | undefined;

      if (isMarketWide) {
        targetCoinId = undefined;
      } else if (isCategory) {
        targetCategory = event.targetCategory;
      } else {
        targetCoinId = state.coins[Math.floor(Math.random() * state.coins.length)].id;
      }
      
      newEvents.push({
        event,
        targetCoinId,
        targetCategory,
        impact: impactValue,
        expiresAt: newTime + 24 * 60 * 60 * 1000 // 1 day duration
      });

      let newsPrefix = '';
      if (isMarketWide) newsPrefix = '【全市場】';
      else if (isCategory) newsPrefix = `【${targetCategory}】`;
      else newsPrefix = `【${targetCoinId}】`;

      newNews.unshift({
        time: newTime,
        text: `${newsPrefix}${event.description}`
      });
    }

    // Keep only latest 50 news
    if (newNews.length > 50) newNews = newNews.slice(0, 50);
  }

  // Calculate index weights
  const top50Coins = state.coins.filter(c => state.top50Ids.includes(c.id));
  const totalTop50Volume = top50Coins.reduce((sum, c) => sum + c.volume30d, 0);

  let indexChangeRatio = 0;

  const newCoins: Coin[] = [];
  const coinReturns: Record<string, number> = {};

  const processCoin = (coin: Coin) => {
    const isTrading = !coin.tradingDate || newTime >= coin.tradingDate;
    
    let newPrice = coin.price;
    let priceChangeRatio = 0;
    let newVolume30d = coin.volume30d;
    let newVolume24h = coin.volume24h || 0;
    let newSentiment = coin.sentiment || 0;
    let newVariance = coin.variance || Math.pow(coin.volatility, 2);
    let newLastNoise = coin.lastNoise || 0;

    if (isTrading) {
      if (coin.isLeveraged && coin.underlyingId) {
        const underlyingReturn = coinReturns[coin.underlyingId] || 0;
        const leverage = coin.leverageFactor || 1;
        
        // Leveraged return = underlying return * leverage
        priceChangeRatio = underlyingReturn * leverage;
        
        // Add small tracking error
        priceChangeRatio += (Math.random() - 0.5) * 0.001;
        
        // Apply management fee (0.08% daily) at the start of a new day
        if (isNewDay) {
          priceChangeRatio -= 0.0008;
        }

        newPrice = coin.price * (1 + priceChangeRatio);
        if (newPrice < 0.00000001) newPrice = 0.00000001;
        priceChangeRatio = (newPrice - coin.price) / coin.price;
      } else if (coin.isETF && coin.components && coin.components.length > 0) {
        let totalReturn = 0;
        let validComponents = 0;
        for (const compId of coin.components) {
          if (coinReturns[compId] !== undefined) {
            totalReturn += coinReturns[compId];
            validComponents++;
          }
        }
        if (validComponents > 0) {
          priceChangeRatio = totalReturn / validComponents;
        }
        // Add small tracking error
        priceChangeRatio += (Math.random() - 0.5) * 0.0005;
        
        // Apply management fee (0.03% daily) at the start of a new day
        if (isNewDay) {
          priceChangeRatio -= 0.0003;
        }

        newPrice = coin.price * (1 + priceChangeRatio);
        if (newPrice < 0.00000001) newPrice = 0.00000001;
        priceChangeRatio = (newPrice - coin.price) / coin.price;
      } else {
        let mu = coin.drift;
        let sigma = coin.volatility;

        // Apply active events
        for (const ev of newEvents) {
          if (!ev.targetCoinId && !ev.targetCategory) {
            // Market-wide
            mu += ev.impact / dt / 144; 
            newSentiment += ev.impact * 10;
          } else if (ev.targetCategory && ev.targetCategory === coin.category) {
            // Category-wide
            mu += ev.impact / dt / 144; 
            newSentiment += ev.impact * 10;
          } else if (ev.targetCoinId === coin.id) {
            // Individual
            mu += ev.impact / dt / 144; 
            newSentiment += ev.impact * 10;
          }
        }

        // Stabilization mechanism (护盘/抛售)
        // If price changes too much in a short time, revert mean
        const dailyStartPrice = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].close : coin.initialPrice;
        const dailyChange = (coin.price - dailyStartPrice) / dailyStartPrice;
        
        if (dailyChange > 0.2) {
          // Too high, sell off
          mu -= 0.5;
        } else if (dailyChange < -0.2) {
          // Too low, buy in
          mu += 0.5;
        }

        // Regime-Switching
        let newRegime = coin.regime || 'sideways';
        if (Math.random() < 5.0 * dt) { // Transition probability
          const regimes: ('bull' | 'bear' | 'sideways')[] = ['bull', 'bear', 'sideways'];
          newRegime = regimes[Math.floor(Math.random() * regimes.length)];
        }
        if (newRegime === 'bull') {
          mu += 0.5;
        } else if (newRegime === 'bear') {
          mu -= 0.5;
        }

        // Hawkes Process (Self-exciting jumps)
        let newHawkesLambda = coin.hawkesLambda || 0;
        const hawkesMu = coin.hawkesMu || 0.1;
        const hawkesAlpha = coin.hawkesAlpha || 0.2;
        const hawkesBeta = coin.hawkesBeta || 1.0;
        
        // Decay intensity
        newHawkesLambda = newHawkesLambda + hawkesBeta * (hawkesMu - newHawkesLambda) * dt;

        // 1. Heston Model: Update variance (Volatility Clustering / GARCH-like)
        const kappa = coin.kappa || 2.0;
        const theta = coin.theta || Math.pow(coin.volatility, 2);
        const xi = coin.xi || 0.1;
        
        const dW_v = randn_bm() * Math.sqrt(dt);
        newVariance = newVariance + kappa * (theta - newVariance) * dt + xi * Math.sqrt(Math.max(0, newVariance)) * dW_v;
        newVariance = Math.max(0.000001, newVariance); // Prevent negative variance
        const currentVolatility = Math.sqrt(newVariance);

        // 2. Hurst Exponent: Fractional Brownian Motion approximation (Long-term memory)
        const hurst = coin.hurst || 0.5;
        const phi = hurst - 0.5; // AR(1) coefficient approximation
        const epsilon = randn_bm();
        newLastNoise = phi * newLastNoise + epsilon * Math.sqrt(1 - phi * phi);
        const dW_s = newLastNoise * Math.sqrt(dt);

        // 3. Jump Diffusion (Merton + Kou + Hawkes)
        const baseLambda = coin.lambda || 2.0;
        const totalLambda = baseLambda + newHawkesLambda;
        
        let jumpMultiplier = 1;
        // Probability of jump in this dt
        if (Math.random() < totalLambda * dt) {
          // Jump occurred! Self-excite Hawkes
          newHawkesLambda += hawkesAlpha;

          if (Math.random() < 0.5) {
            // Merton Jump
            const muJ = coin.muJ || 0;
            const sigmaJ = coin.sigmaJ || 0.1;
            const jumpSize = muJ + sigmaJ * randn_bm();
            jumpMultiplier = Math.exp(jumpSize);
          } else {
            // Kou Jump (Double Exponential)
            const kouP = coin.kouP || 0.5;
            const kouEta1 = coin.kouEta1 || 10;
            const kouEta2 = coin.kouEta2 || 10;
            let jumpSize = 0;
            if (Math.random() < kouP) {
              jumpSize = -Math.log(Math.random()) / kouEta1; // Up jump
            } else {
              jumpSize = Math.log(Math.random()) / kouEta2; // Down jump
            }
            jumpMultiplier = Math.exp(jumpSize);
          }
        }

        // Combine models for price step
        let dS = 0;
        if (coin.ouReversion && coin.ouMean) {
          // OU Model (Mean Reversion, e.g., for Stablecoins)
          dS = coin.ouReversion * (coin.ouMean - coin.price) * dt + currentVolatility * coin.price * dW_s;
        } else {
          // GBM / Bates Model
          dS = mu * coin.price * dt + currentVolatility * coin.price * dW_s;
        }
        
        newPrice = (coin.price + dS) * jumpMultiplier;

        if (coin.isStablecoin) {
          newPrice = Math.max(0.995, Math.min(1.005, newPrice));
        } else if (newPrice < 0.00000001) {
          newPrice = 0.00000001; // Prevent negative or zero
        }

        priceChangeRatio = (newPrice - coin.price) / coin.price;
      }

      // Update sentiment based on price action and mean reversion
      newSentiment -= newSentiment * 0.001; // Slow mean reversion to 0
      newSentiment += priceChangeRatio * 100; // Price momentum impact
      newSentiment += (Math.random() - 0.5) * 0.2; // Random noise
      newSentiment = Math.max(-10, Math.min(10, newSentiment)); // Clamp between -10 and 10

      // Simulate volume
      if (coin.volume30d === 0) {
        // Initial listing volume burst
        newVolume30d = coin.marketCap * (0.02 + Math.random() * 0.08);
        newVolume24h = newVolume30d * 0.1;
      } else {
        const tickVolume = coin.volume30d * (0.0001 + Math.random() * 0.0005);
        newVolume30d = coin.volume30d + tickVolume - (coin.volume30d / 30 / 144); // Rough rolling window
        
        if (isNewDay) {
          newVolume24h = tickVolume; // Reset 24h volume on new day
        } else {
          newVolume24h += tickVolume;
        }
      }
    }

    if (!coin.isETF) {
      coinReturns[coin.id] = priceChangeRatio;
    }

    if (state.top50Ids.includes(coin.id)) {
      const weight = coin.volume30d / totalTop50Volume;
      indexChangeRatio += priceChangeRatio * weight;
    }

    // Update history
    const history = [...coin.history, { time: newTime, price: newPrice }];
    if (history.length > 100) history.shift(); // Keep last 100 ticks for intraday

    // Update daily history
    const dailyHistory = [...coin.dailyHistory];
    if (isNewDay) {
      const prevClose = dailyHistory.length > 0 ? dailyHistory[dailyHistory.length - 1].close : coin.initialPrice;
      dailyHistory.push({
        date: newTime,
        open: prevClose,
        high: Math.max(prevClose, newPrice),
        low: Math.min(prevClose, newPrice),
        close: newPrice
      });
    } else if (dailyHistory.length > 0) {
      const last = { ...dailyHistory[dailyHistory.length - 1] };
      last.high = Math.max(last.high, newPrice);
      last.low = Math.min(last.low, newPrice);
      last.close = newPrice;
      dailyHistory[dailyHistory.length - 1] = last;
    }

    // Simulate circulation changes
    let { locked, staked, circulating } = coin.circulation;
    
    if (locked > 0) {
      const unlockAmount = locked * (Math.random() * 0.0001);
      locked -= unlockAmount;
      circulating += unlockAmount;
    }

    const stakingChange = (Math.random() - 0.5) * 0.01;
    if (stakingChange > 0 && circulating > stakingChange) {
      circulating -= stakingChange;
      staked += stakingChange;
    } else if (stakingChange < 0 && staked > Math.abs(stakingChange)) {
      staked += stakingChange;
      circulating -= stakingChange;
    }

    const totalCirculation = locked + staked + circulating;
    locked = (locked / totalCirculation) * 100;
    staked = (staked / totalCirculation) * 100;
    circulating = (circulating / totalCirculation) * 100;

    newCoins.push({
      ...coin,
      price: newPrice,
      history,
      dailyHistory,
      volume24h: newVolume24h,
      volume30d: newVolume30d,
      circulation: { locked, staked, circulating },
      sentiment: newSentiment,
      variance: newVariance,
      lastNoise: newLastNoise
    });
  };

  // Process normal coins first (not ETF and not Leveraged)
  for (const coin of state.coins) {
    if (!coin.isETF && !coin.isLeveraged) processCoin(coin);
  }

  // Process ETFs and Leveraged tokens (which depend on normal coins)
  for (const coin of state.coins) {
    if (coin.isETF || coin.isLeveraged) processCoin(coin);
  }

  const newIndexValue = state.indexValue * (1 + indexChangeRatio);

  const indexHistory = [...state.indexHistory, { time: newTime, price: newIndexValue }];
  if (indexHistory.length > 100) indexHistory.shift();

  const indexDailyHistory = [...state.indexDailyHistory];
  if (isNewDay) {
    const prevIndexClose = indexDailyHistory.length > 0 ? indexDailyHistory[indexDailyHistory.length - 1].close : 10000;
    indexDailyHistory.push({
      date: newTime,
      open: prevIndexClose,
      high: Math.max(prevIndexClose, newIndexValue),
      low: Math.min(prevIndexClose, newIndexValue),
      close: newIndexValue
    });
  } else if (indexDailyHistory.length > 0) {
    const last = { ...indexDailyHistory[indexDailyHistory.length - 1] };
    last.high = Math.max(last.high, newIndexValue);
    last.low = Math.min(last.low, newIndexValue);
    last.close = newIndexValue;
    indexDailyHistory[indexDailyHistory.length - 1] = last;
  }

  // Update top 50 every 30 days (roughly 30 * 144 ticks)
  let newTop50Ids = state.top50Ids;
  if (newTime % (30 * 24 * 60 * 60 * 1000) < TICK_MS) {
    const eligibleCoins = newCoins.filter(c => !c.isETF && !c.isLeveraged);
    const sorted = [...eligibleCoins].sort((a, b) => b.volume30d - a.volume30d);
    newTop50Ids = sorted.slice(0, 50).map(c => c.id);
  }

  // Process Luck Events Settlement
  for (const event of newLuckEvents) {
    if (event.status === 'active' && newTime >= event.settlementDate) {
      event.status = 'settled';
      
      let targetValue = 0;
      if (event.targetType === 'index') {
        targetValue = newIndexValue;
      } else {
        const targetCoin = newCoins.find(c => c.id === event.targetId);
        if (targetCoin) targetValue = targetCoin.price;
      }
      
      event.settlementValue = targetValue;
      
      let digit = 0;
      if (event.targetDigit === 'units') digit = Math.floor(targetValue) % 10;
      else if (event.targetDigit === 'tens') digit = Math.floor(targetValue / 10) % 10;
      else if (event.targetDigit === 'hundreds') digit = Math.floor(targetValue / 100) % 10;
      else if (event.targetDigit === 'thousands') digit = Math.floor(targetValue / 1000) % 10;
      else if (event.targetDigit === 'ten_thousands') digit = Math.floor(targetValue / 10000) % 10;
      else if (event.targetDigit === 'decimal_1') digit = Math.floor(targetValue * 10) % 10;
      else if (event.targetDigit === 'decimal_2') digit = Math.floor(targetValue * 100) % 10;
      else if (event.targetDigit === 'decimal_3') digit = Math.floor(targetValue * 1000) % 10;
      else if (event.targetDigit === 'decimal_4') digit = Math.floor(targetValue * 10000) % 10;
      
      if (digit >= 1 && digit <= 4) event.winningOption = 'small';
      else if (digit >= 6 && digit <= 9) event.winningOption = 'large';
      else event.winningOption = 'zero_five';
      
      // Payout winning bets
      for (const bet of event.bets) {
        if (bet.option === event.winningOption) {
          newUserBalance += bet.amount * bet.odds;
        }
      }
    }
    
    if (event.status === 'settled' && newTime >= event.delistDate) {
      event.status = 'delisted';
    }
  }
  
  newLuckEvents = newLuckEvents.filter(e => e.status !== 'delisted');

  return {
    currentTime: newTime,
    coins: newCoins,
    indexValue: newIndexValue,
    indexHistory,
    indexDailyHistory,
    activeEvents: newEvents,
    news: newNews,
    top50Ids: newTop50Ids,
    luckEvents: newLuckEvents,
    userBalance: newUserBalance
  };
}
