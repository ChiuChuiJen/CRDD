import { X, TrendingUp, TrendingDown, Activity, BarChart2, List } from 'lucide-react';
import { SimulationState } from '../lib/simulation';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface IndexModalProps {
  state: SimulationState;
  onClose: () => void;
  lang: 'zh' | 'en';
  theme: 'dark' | 'light';
}

export function IndexModal({ state, onClose, lang, theme }: IndexModalProps) {
  const t = {
    zh: {
      title: '加權指數',
      intraday: '時分圖',
      daily: '日線圖',
      top50: '權值股名單及其權值比重',
      coin: '貨幣',
      weight: '權重',
      price: '最新價',
      change: '漲跌幅',
      intradayData: '時分明細',
      time: '時間',
    },
    en: {
      title: 'Weighted Index',
      intraday: 'Intraday',
      daily: 'Daily',
      top50: 'Top 50 Weighted Coins & Weights',
      coin: 'Coin',
      weight: 'Weight',
      price: 'Price',
      change: 'Change',
      intradayData: 'Intraday Data',
      time: 'Time',
    }
  }[lang];

  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  const startValue = state.indexDailyHistory.length > 0 ? state.indexDailyHistory[state.indexDailyHistory.length - 1].open : 10000;
  const change = (state.indexValue - startValue) / startValue;
  const isUp = change >= 0;

  const formatTime = (time: number) => {
    const d = new Date(time);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (time: number) => {
    const d = new Date(time);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Calculate weights
  const top50Coins = state.coins.filter(c => state.top50Ids.includes(c.id));
  const totalTop50Volume = top50Coins.reduce((sum, c) => sum + c.volume30d, 0);
  
  const top50WithWeights = top50Coins.map(coin => {
    const startPrice = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].open : coin.initialPrice;
    const coinChange = (coin.price - startPrice) / startPrice;
    return {
      ...coin,
      weight: (coin.volume30d / totalTop50Volume) * 100,
      change: coinChange
    };
  }).sort((a, b) => b.weight - a.weight);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-inner">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t.title}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="font-mono text-xl font-semibold text-slate-900 dark:text-white">
                  {state.indexValue.toFixed(2)}
                </span>
                <span className={`flex items-center font-medium ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {isUp ? <TrendingUp size={18} className="mr-1" /> : <TrendingDown size={18} className="mr-1" />}
                  {Math.abs(change * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Intraday Chart */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={16} /> {t.intraday}
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={state.indexHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIndexPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={formatTime} 
                        stroke={textColor} 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke={textColor} 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => val.toFixed(0)}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px' }}
                        itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        formatter={(value: number) => [value.toFixed(2), t.title]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isUp ? '#10b981' : '#f43f5e'} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorIndexPrice)" 
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Chart */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart2 size={16} /> {t.daily}
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={state.indexDailyHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate} 
                        stroke={textColor} 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        minTickGap={20}
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke={textColor} 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => val.toFixed(0)}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        formatter={(value: number, name: string) => [value.toFixed(2), name]}
                      />
                      <Bar dataKey="close" isAnimationActive={false}>
                        {state.indexDailyHistory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Intraday Data */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <List size={16} /> {t.intradayData}
                </h3>
                <div className="max-h-[300px] overflow-y-auto pr-2">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 rounded-l-lg">{t.time}</th>
                        <th className="px-4 py-2">{t.price}</th>
                        <th className="px-4 py-2 rounded-r-lg text-right">{t.change}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.indexHistory.slice().reverse().map((point, i, arr) => {
                        const prevPrice = i < arr.length - 1 ? arr[i + 1].price : 10000;
                        const pointChange = (point.price - prevPrice) / prevPrice;
                        const isPointUp = pointChange >= 0;
                        return (
                          <tr key={point.time} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-300">{formatTime(point.time)}</td>
                            <td className="px-4 py-2 font-mono font-medium text-slate-900 dark:text-white">
                              {point.price.toFixed(2)}
                            </td>
                            <td className={`px-4 py-2 font-mono text-right ${isPointUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {isPointUp ? '+' : ''}{(pointChange * 100).toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Top 50 List */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col h-[550px]">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 flex-shrink-0">
                <List size={16} /> {t.top50}
              </h3>
              <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {top50WithWeights.map((coin, index) => {
                  const isCoinUp = coin.change >= 0;
                  return (
                    <div key={coin.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">{coin.symbol}</div>
                          <div className={`text-xs font-medium ${isCoinUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isCoinUp ? '+' : ''}{(coin.change * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                          {coin.weight.toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t.weight}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
