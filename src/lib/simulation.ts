import { Coin, MarketEvent, ImpactLevel } from '../data/parser';

export interface SimulationState {
  currentTime: number;
  coins: Coin[];
  indexValue: number;
  indexHistory: { time: number, price: number }[];
  indexDailyHistory: { date: number, open: number, high: number, low: number, close: number }[];
  activeEvents: { event: MarketEvent, targetCoinId?: string, impact: number, expiresAt: number }[];
  news: { time: number, text: string }[];
  top50Ids: string[];
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

export function initializeSimulation(coins: Coin[]): SimulationState {
  // Determine initial top 50
  const sorted = [...coins].sort((a, b) => b.volume30d - a.volume30d);
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

  return {
    currentTime: now,
    coins: initializedCoins,
    indexValue: 10000,
    indexHistory: [{ time: now, price: 10000 }],
    indexDailyHistory: [{ date: now, open: 10000, high: 10000, low: 10000, close: 10000 }],
    activeEvents: [],
    news: [],
    top50Ids
  };
}

export function tickSimulation(
  state: SimulationState, 
  eventsA: MarketEvent[], 
  eventsB: MarketEvent[], 
  impacts: ImpactLevel[]
): SimulationState {
  const TICK_MS = 10 * 60 * 1000; // 10 minutes
  const dt = TICK_MS / (365 * 24 * 60 * 60 * 1000); // dt in years
  
  const newTime = state.currentTime + TICK_MS;
  const isNewDay = new Date(newTime).getDate() !== new Date(state.currentTime).getDate();
  
  let newEvents = [...state.activeEvents].filter(e => e.expiresAt > newTime);
  let newNews = [...state.news];

  // Generate new events if it's a new day
  if (isNewDay) {
    const numEvents = Math.floor(Math.random() * 5); // 0 to 4 events
    for (let i = 0; i < numEvents; i++) {
      const isMarketWide = Math.random() > 0.8; // 20% chance for market-wide
      const eventList = isMarketWide ? eventsB : eventsA;
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

      const targetCoinId = isMarketWide ? undefined : state.coins[Math.floor(Math.random() * state.coins.length)].id;
      
      newEvents.push({
        event,
        targetCoinId,
        impact: impactValue,
        expiresAt: newTime + 24 * 60 * 60 * 1000 // 1 day duration
      });

      newNews.unshift({
        time: newTime,
        text: `${isMarketWide ? '【全市場】' : `【${targetCoinId}】`}${event.description}`
      });
    }

    // Keep only latest 50 news
    if (newNews.length > 50) newNews = newNews.slice(0, 50);
  }

  // Calculate index weights
  const top50Coins = state.coins.filter(c => state.top50Ids.includes(c.id));
  const totalTop50Volume = top50Coins.reduce((sum, c) => sum + c.volume30d, 0);

  let indexChangeRatio = 0;

  const newCoins = state.coins.map(coin => {
    const isTrading = !coin.tradingDate || newTime >= coin.tradingDate;
    
    let newPrice = coin.price;
    let priceChangeRatio = 0;
    let newVolume30d = coin.volume30d;
    let newVolume24h = coin.volume24h || 0;
    let newSentiment = coin.sentiment || 0;
    let newVariance = coin.variance || Math.pow(coin.volatility, 2);
    let newLastNoise = coin.lastNoise || 0;

    if (isTrading) {
      let mu = coin.drift;
      let sigma = coin.volatility;

      // Apply active events
      for (const ev of newEvents) {
        if (!ev.targetCoinId || ev.targetCoinId === coin.id) {
          // Event impact is spread over the day (144 ticks)
          mu += ev.impact / dt / 144; 
          newSentiment += ev.impact * 10; // Events directly impact sentiment
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

      // 1. Heston Model: Update variance (Volatility Clustering)
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

      // 3. Merton Jump Diffusion: Poisson process for sudden jumps
      const lambda = coin.lambda || 2.0;
      const muJ = coin.muJ || 0;
      const sigmaJ = coin.sigmaJ || 0.1;
      
      let jumpMultiplier = 1;
      // Probability of jump in this dt
      if (Math.random() < lambda * dt) {
        const jumpSize = muJ + sigmaJ * randn_bm();
        jumpMultiplier = Math.exp(jumpSize);
      }

      // Combine models for price step
      const dS = mu * coin.price * dt + currentVolatility * coin.price * dW_s;
      newPrice = (coin.price + dS) * jumpMultiplier;

      if (newPrice < 0.00000001) newPrice = 0.00000001; // Prevent negative or zero

      priceChangeRatio = (newPrice - coin.price) / coin.price;

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

    return {
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
    };
  });

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
    const sorted = [...newCoins].sort((a, b) => b.volume30d - a.volume30d);
    newTop50Ids = sorted.slice(0, 50).map(c => c.id);
  }

  return {
    currentTime: newTime,
    coins: newCoins,
    indexValue: newIndexValue,
    indexHistory,
    indexDailyHistory,
    activeEvents: newEvents,
    news: newNews,
    top50Ids: newTop50Ids
  };
}
