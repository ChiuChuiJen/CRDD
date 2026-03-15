import { X, TrendingUp, TrendingDown, Users, Activity, Info, BarChart2, List, PieChart } from 'lucide-react';
import { Coin } from '../data/parser';
import {
  LineChart,
  Line,
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

interface CoinModalProps {
  coin: Coin;
  onClose: () => void;
  lang: 'zh' | 'en';
  theme: 'dark' | 'light';
}

export function CoinModal({ coin, onClose, lang, theme }: CoinModalProps) {
  const t = {
    zh: {
      info: '貨幣資訊',
      chart: '走勢圖',
      chips: '籌碼分布',
      basic: '基本資訊',
      price: '當前價格',
      marketCap: '市值',
      supply: '發行量',
      desc: '貨幣介紹',
      foreign: '外資',
      institution: '法人',
      large: '大戶',
      retail: '散戶',
      intraday: '時分圖',
      daily: '日線圖',
      amplitude: '當日震幅',
      intradayData: '時分明細',
      time: '時間',
      change: '漲跌幅',
      upcoming: '即將上市',
      days: '天',
      circulation: '市場流通狀況',
      circulating: '流通中',
      staked: '質押中',
      locked: '團隊鎖倉中',
      sentiment: '市場看好度',
    },
    en: {
      info: 'Coin Info',
      chart: 'Charts',
      chips: 'Chip Distribution',
      basic: 'Basic Info',
      price: 'Current Price',
      marketCap: 'Market Cap',
      supply: 'Total Supply',
      desc: 'Description',
      foreign: 'Foreign',
      institution: 'Institution',
      large: 'Large Holder',
      retail: 'Retail',
      intraday: 'Intraday',
      daily: 'Daily',
      amplitude: 'Daily Amplitude',
      intradayData: 'Intraday Data',
      time: 'Time',
      change: 'Change',
      upcoming: 'Upcoming',
      days: 'd',
      circulation: 'Circulation Status',
      circulating: 'Circulating',
      staked: 'Staked',
      locked: 'Team Locked',
      sentiment: 'Market Sentiment',
    }
  }[lang];

  const chartColor = theme === 'dark' ? '#818cf8' : '#6366f1';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  const startPrice = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].open : coin.initialPrice;
  const change = (coin.price - startPrice) / startPrice;
  const isUp = change >= 0;
  const high = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].high : coin.price;
  const low = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].low : coin.price;
  const amplitude = ((high - low) / startPrice) * 100;

  const currentTime = coin.history.length > 0 ? coin.history[coin.history.length - 1].time : Date.now();
  const isTrading = !coin.tradingDate || currentTime >= coin.tradingDate;
  const daysUntilTrading = coin.tradingDate ? Math.ceil((coin.tradingDate - currentTime) / (24 * 60 * 60 * 1000)) : 0;

  const chipData = [
    { name: t.foreign, value: coin.chipDistribution.foreign, color: '#3b82f6' },
    { name: t.institution, value: coin.chipDistribution.institution, color: '#8b5cf6' },
    { name: t.large, value: coin.chipDistribution.largeHolder, color: '#f59e0b' },
    { name: t.retail, value: coin.chipDistribution.retail, color: '#10b981' },
  ];

  const circulationData = [
    { name: t.circulating, value: coin.circulation?.circulating || 100, color: '#10b981' },
    { name: t.staked, value: coin.circulation?.staked || 0, color: '#f59e0b' },
    { name: t.locked, value: coin.circulation?.locked || 0, color: '#64748b' }
  ];

  const formatTime = (time: number) => {
    const d = new Date(time);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (time: number) => {
    const d = new Date(time);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-inner">
              {coin.symbol.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {coin.name} 
                <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {coin.symbol}
                </span>
                {!isTrading && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                    {t.upcoming} {daysUntilTrading > 0 ? `(${daysUntilTrading}${t.days})` : ''}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="font-mono text-xl font-semibold text-slate-900 dark:text-white">
                  {coin.price < 0.01 ? coin.price.toFixed(8) : coin.price.toFixed(4)} CRDT
                </span>
                {isTrading && (
                  <span className={`flex items-center font-medium ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isUp ? <TrendingUp size={18} className="mr-1" /> : <TrendingDown size={18} className="mr-1" />}
                    {Math.abs(change * 100).toFixed(2)}%
                  </span>
                )}
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
                    <AreaChart data={coin.history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                        tickFormatter={(val) => val < 0.01 ? val.toFixed(6) : val.toFixed(2)}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px' }}
                        itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                        labelFormatter={(label) => new Date(label).toLocaleString()}
                        formatter={(value: number) => [value < 0.01 ? value.toFixed(8) : value.toFixed(4), 'Price']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isUp ? '#10b981' : '#f43f5e'} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
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
                    <BarChart data={coin.dailyHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
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
                        tickFormatter={(val) => val < 0.01 ? val.toFixed(6) : val.toFixed(2)}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme === 'dark' ? '#1e293b' : '#fff', borderColor: theme === 'dark' ? '#334155' : '#e2e8f0', borderRadius: '8px' }}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        formatter={(value: number, name: string) => [value < 0.01 ? value.toFixed(8) : value.toFixed(4), name]}
                      />
                      <Bar dataKey="close" isAnimationActive={false}>
                        {coin.dailyHistory.map((entry, index) => (
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
                      {coin.history.slice().reverse().map((point, i, arr) => {
                        const prevPrice = i < arr.length - 1 ? arr[i + 1].price : coin.initialPrice;
                        const pointChange = (point.price - prevPrice) / prevPrice;
                        const isPointUp = pointChange >= 0;
                        return (
                          <tr key={point.time} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-300">{formatTime(point.time)}</td>
                            <td className="px-4 py-2 font-mono font-medium text-slate-900 dark:text-white">
                              {point.price < 0.01 ? point.price.toFixed(8) : point.price.toFixed(4)}
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

            {/* Right Column: Info & Chips */}
            <div className="space-y-8">
              
              {/* Basic Info */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info size={16} /> {t.basic}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.marketCap}</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white">
                      {(coin.marketCap / 100000000).toFixed(2)} 億 CRDT
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.supply}</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white">
                      {(coin.totalSupply / 1000000).toFixed(2)} M
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.amplitude}</div>
                    <div className="font-mono font-medium text-slate-900 dark:text-white">
                      {amplitude.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.sentiment}</div>
                    <div className={`font-mono font-medium ${
                      (coin.sentiment || 0) > 0 ? 'text-emerald-500' : 
                      (coin.sentiment || 0) < 0 ? 'text-rose-500' : 
                      'text-slate-500 dark:text-slate-400'
                    }`}>
                      {(coin.sentiment || 0) > 0 ? '+' : ''}{(coin.sentiment || 0).toFixed(1)}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t.desc}</div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {coin.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chip Distribution */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={16} /> {t.chips}
                </h3>
                <div className="space-y-4">
                  {chipData.map((chip, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{chip.name}</span>
                        <span className="font-mono text-slate-900 dark:text-white">{chip.value.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${chip.value}%`, backgroundColor: chip.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circulation Status */}
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PieChart size={16} /> {t.circulation}
                </h3>
                <div className="space-y-4">
                  {circulationData.map((circ, i) => {
                    const amount = (coin.totalSupply * (circ.value / 100));
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{circ.name}</span>
                          <div className="text-right">
                            <span className="font-mono text-slate-900 dark:text-white block">{circ.value.toFixed(1)}%</span>
                            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                              {(amount / 1000000).toFixed(2)}M
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ width: `${circ.value}%`, backgroundColor: circ.color }}
                          ></div>
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
    </div>
  );
}
