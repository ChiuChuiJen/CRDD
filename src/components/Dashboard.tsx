import { useState } from 'react';
import { SimulationState } from '../lib/simulation';
import { Coin } from '../data/parser';
import { ArrowUpRight, ArrowDownRight, Activity, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface DashboardProps {
  state: SimulationState;
  lang: 'zh' | 'en';
  onSelectCoin: (coin: Coin) => void;
}

type SortColumn = 'coin' | 'price' | 'change' | 'volume' | 'status';
type SortDirection = 'asc' | 'desc';

export function Dashboard({ state, lang, onSelectCoin }: DashboardProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('coin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const t = {
    zh: {
      coins: '市場行情',
      news: '公告及新聞',
      top50: '權值股 (Top 50)',
      price: '最新價',
      change: '漲跌幅',
      vol: '成交量',
    },
    en: {
      coins: 'Market',
      news: 'News & Announcements',
      top50: 'Weighted (Top 50)',
      price: 'Price',
      change: 'Change',
      vol: 'Volume',
    }
  }[lang];

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'coin' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />;
  };

  const coinsWithStats = state.coins.map(coin => {
    const isTop50 = state.top50Ids.includes(coin.id);
    const startPrice = coin.dailyHistory.length > 0 ? coin.dailyHistory[coin.dailyHistory.length - 1].open : coin.initialPrice;
    const change = (coin.price - startPrice) / startPrice;
    return { ...coin, isTop50, change };
  });

  const sortedCoins = [...coinsWithStats].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortColumn) {
      case 'coin':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'change':
        aValue = a.change;
        bValue = b.change;
        break;
      case 'volume':
        aValue = a.volume30d;
        bValue = b.volume30d;
        break;
      case 'status':
        aValue = a.isTop50 ? 1 : 0;
        bValue = b.isTop50 ? 1 : 0;
        break;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-indigo-500" />
            {t.coins}
          </h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {state.coins.length} Coins Listed
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-b-2 border-indigo-500/50">
                <tr>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('coin')}
                  >
                    <div className="flex items-center gap-1">COIN <SortIcon column="coin" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end gap-1">{t.price} (CRDT) <SortIcon column="price" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('change')}
                  >
                    <div className="flex items-center justify-end gap-1">{t.change} <SortIcon column="change" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('volume')}
                  >
                    <div className="flex items-center justify-end gap-1">{t.vol} (30D) <SortIcon column="volume" /></div>
                  </th>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">STATUS <SortIcon column="status" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {sortedCoins.map(coin => {
                  const isUp = coin.change >= 0;

                  return (
                    <tr 
                      key={coin.id} 
                      onClick={() => onSelectCoin(coin)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {coin.symbol}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{coin.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium text-slate-900 dark:text-white">
                        {coin.price < 0.01 ? coin.price.toFixed(8) : coin.price.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`inline-flex items-center gap-1 font-medium ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {Math.abs(coin.change * 100).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 font-mono">
                        {(coin.volume30d / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {coin.isTop50 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            Top 50
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-24">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {t.news}
            </h3>
          </div>
          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
            {state.news.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                No news yet...
              </div>
            ) : (
              state.news.map((n, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-indigo-500/30 dark:border-indigo-500/50 pb-4 last:pb-0">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white dark:ring-slate-900"></div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mb-1 font-mono">
                    {new Date(n.time).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {n.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
