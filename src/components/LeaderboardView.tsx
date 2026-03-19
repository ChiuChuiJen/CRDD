import { useState, useMemo } from 'react';
import { SimulationState } from '../lib/simulation';
import { Coin } from '../data/parser';
import { Trophy, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface LeaderboardViewProps {
  state: SimulationState;
  lang: 'zh' | 'en';
  onSelectCoin: (coin: Coin) => void;
}

type Period = 7 | 20 | 30;
type BoardType = 'marketCap' | 'gainers' | 'losers' | 'volatility';

export function LeaderboardView({ state, lang, onSelectCoin }: LeaderboardViewProps) {
  const [period, setPeriod] = useState<Period>(7);
  const [boardType, setBoardType] = useState<BoardType>('marketCap');

  const t = {
    zh: {
      marketCap: '市值榜',
      gainers: '漲幅榜',
      losers: '跌幅榜',
      volatility: '波動率榜',
      days7: '7日',
      days20: '20日',
      days30: '30日',
      rank: '排名',
      coin: '幣種',
      price: '最新價',
      marketCapValue: '市值',
      change: '漲跌幅',
      volatilityValue: '波動率',
    },
    en: {
      marketCap: 'Market Cap',
      gainers: 'Top Gainers',
      losers: 'Top Losers',
      volatility: 'Top Volatility',
      days7: '7D',
      days20: '20D',
      days30: '30D',
      rank: 'Rank',
      coin: 'Coin',
      price: 'Price',
      marketCapValue: 'Market Cap',
      change: 'Change',
      volatilityValue: 'Volatility',
    }
  }[lang];

  const getMetrics = (coin: Coin, days: number) => {
    const history = coin.dailyHistory;
    if (history.length === 0) return { change: 0, volatility: 0 };
    
    const currentPrice = coin.price;
    const startIndex = Math.max(0, history.length - days);
    const startPrice = history[startIndex].open;
    
    const change = startPrice > 0 ? (currentPrice - startPrice) / startPrice : 0;
    
    let returns = [];
    for (let i = startIndex; i < history.length; i++) {
      const prevClose = i > 0 ? history[i-1].close : history[i].open;
      const dailyReturn = prevClose > 0 ? (history[i].close - prevClose) / prevClose : 0;
      returns.push(dailyReturn);
    }
    
    let volatility = 0;
    if (returns.length > 0) {
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      volatility = Math.sqrt(variance);
    }

    return { change, volatility };
  };

  const sortedCoins = useMemo(() => {
    const coinsWithMetrics = state.coins.map(coin => {
      const metrics = getMetrics(coin, period);
      return { ...coin, ...metrics };
    });

    switch (boardType) {
      case 'marketCap':
        return coinsWithMetrics.sort((a, b) => b.marketCap - a.marketCap);
      case 'gainers':
        return coinsWithMetrics.sort((a, b) => b.change - a.change);
      case 'losers':
        return coinsWithMetrics.sort((a, b) => a.change - b.change);
      case 'volatility':
        return coinsWithMetrics.sort((a, b) => b.volatility - a.volatility);
      default:
        return coinsWithMetrics;
    }
  }, [state.coins, boardType, period]);

  const topCoins = sortedCoins.slice(0, 50); // Show top 50

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {[
            { id: 'marketCap', label: t.marketCap, icon: Trophy },
            { id: 'gainers', label: t.gainers, icon: TrendingUp },
            { id: 'losers', label: t.losers, icon: TrendingDown },
            { id: 'volatility', label: t.volatility, icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setBoardType(tab.id as BoardType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                boardType === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {boardType !== 'marketCap' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {[
              { id: 7, label: t.days7 },
              { id: 20, label: t.days20 },
              { id: 30, label: t.days30 }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as Period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b-2 border-indigo-500/50">
            <tr>
              <th className="px-6 py-4 font-medium">{t.rank}</th>
              <th className="px-6 py-4 font-medium">{t.coin}</th>
              <th className="px-6 py-4 font-medium text-right">{t.price}</th>
              {boardType === 'marketCap' && <th className="px-6 py-4 font-medium text-right">{t.marketCapValue}</th>}
              {(boardType === 'gainers' || boardType === 'losers') && <th className="px-6 py-4 font-medium text-right">{t.change}</th>}
              {boardType === 'volatility' && <th className="px-6 py-4 font-medium text-right">{t.volatilityValue}</th>}
            </tr>
          </thead>
          <tbody>
            {topCoins.map((coin, index) => (
              <tr 
                key={coin.id}
                onClick={() => onSelectCoin(coin)}
                className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index < 3 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {coin.symbol}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{coin.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium text-slate-900 dark:text-white">
                  {coin.price < 0.01 ? coin.price.toFixed(8) : coin.price.toFixed(4)}
                </td>
                {boardType === 'marketCap' && (
                  <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">
                    {(coin.marketCap / 100000000).toFixed(2)} 億
                  </td>
                )}
                {(boardType === 'gainers' || boardType === 'losers') && (
                  <td className={`px-6 py-4 text-right font-mono font-medium ${coin.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {coin.change >= 0 ? '+' : ''}{(coin.change * 100).toFixed(2)}%
                  </td>
                )}
                {boardType === 'volatility' && (
                  <td className="px-6 py-4 text-right font-mono text-amber-500">
                    {(coin.volatility * 100).toFixed(2)}%
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
