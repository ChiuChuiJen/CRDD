import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SimulationState } from '../lib/simulation';
import { Coin } from '../data/parser';

interface SentimentModalProps {
  state: SimulationState;
  onClose: () => void;
  onSelectCoin: (coin: Coin) => void;
  lang: 'zh' | 'en';
}

export function SentimentModal({ state, onClose, onSelectCoin, lang }: SentimentModalProps) {
  const t = {
    zh: {
      title: '市場看好度分佈',
      bullish: '看好',
      neutral: '中立',
      bearish: '看衰',
      avg: '平均',
      count: '檔',
      coin: '貨幣',
      sentiment: '分數',
    },
    en: {
      title: 'Market Sentiment Distribution',
      bullish: 'Bullish',
      neutral: 'Neutral',
      bearish: 'Bearish',
      avg: 'Avg',
      count: 'coins',
      coin: 'Coin',
      sentiment: 'Score',
    }
  }[lang];

  const bullishCoins = state.coins.filter(c => (c.sentiment || 0) > 0.5).sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0));
  const bearishCoins = state.coins.filter(c => (c.sentiment || 0) < -0.5).sort((a, b) => (a.sentiment || 0) - (b.sentiment || 0));
  const neutralCoins = state.coins.filter(c => (c.sentiment || 0) >= -0.5 && (c.sentiment || 0) <= 0.5).sort((a, b) => (b.sentiment || 0) - (a.sentiment || 0));

  const avgSentiment = (coins: Coin[]) => coins.length ? (coins.reduce((sum, c) => sum + (c.sentiment || 0), 0) / coins.length).toFixed(1) : '0.0';

  const CoinList = ({ coins, title, icon: Icon, colorClass, bgClass }: any) => (
    <div className={`rounded-xl p-4 border ${bgClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${colorClass}`}>
          <Icon size={18} /> {title}
        </h3>
        <div className="text-sm font-mono text-slate-500 dark:text-slate-400">
          {coins.length} {t.count} | {t.avg}: {avgSentiment(coins)}
        </div>
      </div>
      <div className="max-h-[250px] overflow-y-auto pr-2 space-y-2">
        {coins.map((coin: Coin) => (
          <div 
            key={coin.id} 
            onClick={() => {
              onSelectCoin(coin);
              onClose();
            }}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors"
          >
            <span className="font-medium text-slate-700 dark:text-slate-300">{coin.symbol}</span>
            <span className={`font-mono text-sm ${colorClass}`}>
              {(coin.sentiment || 0) > 0 ? '+' : ''}{(coin.sentiment || 0).toFixed(1)}
            </span>
          </div>
        ))}
        {coins.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-4">No coins</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CoinList 
              coins={bullishCoins} 
              title={t.bullish} 
              icon={TrendingUp} 
              colorClass="text-emerald-500" 
              bgClass="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" 
            />
            <CoinList 
              coins={neutralCoins} 
              title={t.neutral} 
              icon={Minus} 
              colorClass="text-slate-500" 
              bgClass="bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800/50" 
            />
            <CoinList 
              coins={bearishCoins} 
              title={t.bearish} 
              icon={TrendingDown} 
              colorClass="text-rose-500" 
              bgClass="bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
