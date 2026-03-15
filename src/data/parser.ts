import { coinsRaw } from './coinsRaw';
import { eventsRaw } from './eventsRaw';

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  initialPrice: number;
  price: number;
  totalSupply: number;
  marketCap: number;
  description: string;
  volume24h: number;
  volume30d: number;
  history: { time: number; price: number }[];
  dailyHistory: { date: number; open: number; high: number; low: number; close: number }[];
  chipDistribution: {
    foreign: number;
    institution: number;
    largeHolder: number;
    retail: number;
  };
  circulation: {
    circulating: number; // 流通中 (%)
    staked: number;      // 質押中 (%)
    locked: number;      // 團隊鎖倉中 (%)
  };
  sentiment: number; // -10 to 10
  volatility: number; // sigma
  drift: number; // mu
  variance: number; // Heston variance
  kappa: number; // Heston mean reversion rate
  theta: number; // Heston long-term variance
  xi: number; // Heston volatility of volatility
  lambda: number; // Merton jump intensity
  muJ: number; // Merton jump mean
  sigmaJ: number; // Merton jump volatility
  hurst: number; // Hurst exponent
  lastNoise: number; // For Hurst approximation
  tradingDate?: number;
  issueDate?: number;
}

export interface MarketEvent {
  id: string;
  type: 'A' | 'B'; // A: Individual, B: Market-wide
  description: string;
}

export interface ImpactLevel {
  level: number;
  min: number;
  max: number;
  probability: number;
  isSymmetric?: boolean;
}

export function parseCoins(): Coin[] {
  const lines = coinsRaw.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => {
    // Example: 1. 貨幣全名：Astra Coin | 代號：ACN | 幣價：28650 | 發行量：21000000 | 市值：601650000000 | 貨幣介紹：高速跨鏈支付主鏈幣
    const parts = line.split('|').map(p => p.trim());
    const namePart = parts[0].split('：')[1].trim();
    const symbol = parts[1].split('：')[1].trim();
    const price = parseFloat(parts[2].split('：')[1].trim());
    const totalSupply = parseFloat(parts[3].split('：')[1].trim());
    const marketCap = parseFloat(parts[4].split('：')[1].trim());
    const description = parts[5].split('：')[1].trim();

    // Generate random initial chip distribution
    const foreign = Math.random() * 40 + 10;
    const institution = Math.random() * 30 + 10;
    const largeHolder = Math.random() * 20 + 5;
    const retail = 100 - foreign - institution - largeHolder;

    // Generate random initial circulation distribution
    const locked = Math.random() * 30 + 10; // 10% to 40% locked
    const staked = Math.random() * 40 + 10; // 10% to 50% staked
    const circulating = 100 - locked - staked;

    return {
      id: symbol,
      name: namePart,
      symbol,
      initialPrice: price,
      price,
      totalSupply,
      marketCap,
      description,
      volume24h: Math.random() * marketCap * 0.01, // Random initial 24h volume
      volume30d: Math.random() * marketCap * 0.1, // Random initial volume
      history: [{ time: Date.now(), price }],
      dailyHistory: [],
      chipDistribution: {
        foreign,
        institution,
        largeHolder,
        retail
      },
      circulation: {
        circulating,
        staked,
        locked
      },
      sentiment: (Math.random() - 0.5) * 10, // -5 to 5 initial sentiment
      volatility: Math.random() * 0.05 + 0.01, // 1% to 6% base volatility
      drift: (Math.random() - 0.5) * 0.001, // Slight drift
      variance: Math.pow(Math.random() * 0.05 + 0.01, 2), // Initial variance
      kappa: Math.random() * 2 + 1, // Mean reversion rate (1 to 3)
      theta: Math.pow(Math.random() * 0.05 + 0.01, 2), // Long-term variance
      xi: Math.random() * 0.2 + 0.05, // Vol of vol
      lambda: Math.random() * 5 + 1, // Jumps per year
      muJ: (Math.random() - 0.5) * 0.1, // Mean jump size
      sigmaJ: Math.random() * 0.1 + 0.05, // Jump volatility
      hurst: Math.random() * 0.4 + 0.3, // Hurst exponent (0.3 to 0.7)
      lastNoise: 0
    };
  });
}

export function parseEvents(): { eventsA: MarketEvent[], eventsB: MarketEvent[], impacts: ImpactLevel[] } {
  const lines = eventsRaw.split('\n').map(l => l.trim());
  const eventsA: MarketEvent[] = [];
  const eventsB: MarketEvent[] = [];
  const impacts: ImpactLevel[] = [];

  let currentSection = '';

  for (const line of lines) {
    if (!line) continue;
    if (line.includes('【A類：各別貨幣事件')) {
      currentSection = 'A';
      continue;
    } else if (line.includes('【B類：全體市場事件')) {
      currentSection = 'B';
      continue;
    } else if (line.includes('【影響範圍跟機率】')) {
      currentSection = 'Impact';
      continue;
    }

    if (currentSection === 'A' && line.startsWith('A')) {
      const [id, desc] = line.split('｜');
      eventsA.push({ id, type: 'A', description: desc });
    } else if (currentSection === 'B' && line.startsWith('B')) {
      const [id, desc] = line.split('｜');
      eventsB.push({ id, type: 'B', description: desc });
    } else if (currentSection === 'Impact' && /^\d{2}｜/.test(line)) {
      // Example: 01｜極微影響（±0.1% ～ ±0.5%）：32%
      const match = line.match(/(\d{2})｜.*?（([±+-]?[\d.]+)% ～ ([±+-]?[\d.]+)%）：([\d.]+)%/);
      if (match) {
        let minStr = match[2];
        let maxStr = match[3];
        let isSymmetric = minStr.startsWith('±') || maxStr.startsWith('±');
        
        let min = parseFloat(minStr.replace('±', ''));
        let max = parseFloat(maxStr.replace('±', ''));
        
        impacts.push({
          level: parseInt(match[1]),
          min: (isSymmetric ? min : parseFloat(minStr)) / 100,
          max: (isSymmetric ? max : parseFloat(maxStr)) / 100,
          probability: parseFloat(match[4]) / 100,
          isSymmetric
        });
      }
    }
  }

  return { eventsA, eventsB, impacts };
}
