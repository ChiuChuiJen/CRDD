import React, { useState } from 'react';
import { NFT } from '../data/parser';
import { X, User, Tag, Layers, Info, TrendingUp, PieChart, ShieldCheck, ExternalLink, Activity, BarChart3, Clock, Wallet, Share2, Heart, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart as RePieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

interface NFTModalProps {
  nft: NFT;
  onClose: () => void;
}

const NFTModal: React.FC<NFTModalProps> = ({ nft, onClose }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'UR': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'SSR': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'SR': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const chartData = nft.history.map(h => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: h.price
  }));

  const chipData = [
    { name: '外資', value: nft.chipDistribution.foreign, color: '#6366f1' },
    { name: '機構', value: nft.chipDistribution.institution, color: '#8b5cf6' },
    { name: '大戶', value: nft.chipDistribution.largeHolder, color: '#ec4899' },
    { name: '散戶', value: nft.chipDistribution.retail, color: '#10b981' }
  ];

  const circulationData = [
    { name: '流通中', value: nft.circulation.circulating, color: '#10b981' },
    { name: '質押中', value: nft.circulation.staked, color: '#f59e0b' },
    { name: '鎖倉中', value: nft.circulation.locked, color: '#ef4444' }
  ];

  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Simulated recent trades with more variety
  const recentTrades = [
    { id: 1, type: '成交', price: nft.price * 0.99, amount: 1, time: '2 分鐘前', from: '0x7a...2b4c', to: '0x12...3456', isWhale: false },
    { id: 2, type: '成交', price: nft.price * 1.05, amount: 15, time: '15 分鐘前', from: '0x3f...9d1e', to: '0xWhale', isWhale: true },
    { id: 3, type: '掛單', price: nft.price * 1.12, amount: 1, time: '1 小時前', from: '0x1c...8e2f', to: '-', isWhale: false },
    { id: 4, type: '出價', price: nft.price * 0.92, amount: 5, time: '3 小時前', from: '0x9b...4a5d', to: '-', isWhale: false },
    { id: 5, type: '成交', price: nft.price * 0.98, amount: 2, time: '5 小時前', from: '0x00...0000', to: '0x9b...4a5d', isWhale: false },
  ];

  // Simulated market depth
  const marketDepth = {
    bids: [
      { price: nft.price * 0.98, amount: 5, total: 5 },
      { price: nft.price * 0.95, amount: 12, total: 17 },
      { price: nft.price * 0.92, amount: 25, total: 42 },
    ],
    asks: [
      { price: nft.price * 1.02, amount: 3, total: 3 },
      { price: nft.price * 1.05, amount: 8, total: 11 },
      { price: nft.price * 1.10, amount: 15, total: 26 },
    ]
  };

  const volumeData = nft.history.slice(-10).map((h, i) => ({
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    volume: Math.random() * nft.price * 5
  }));

  const priceChange = nft.dailyHistory.length > 0 
    ? ((nft.price - nft.dailyHistory[nft.dailyHistory.length - 1].open) / nft.dailyHistory[nft.dailyHistory.length - 1].open) * 100
    : 0;

  const high24h = nft.price * 1.15;
  const low24h = nft.price * 0.85;
  const pricePos = ((nft.price - low24h) / (high24h - low24h)) * 100;

  const [activityTab, setActivityTab] = useState<'history' | 'offers'>('history');

  // Simulated active offers
  const activeOffers = [
    { id: 1, price: nft.price * 0.95, from: '0x12...3456', time: '5 分鐘前', status: 'Active' },
    { id: 2, price: nft.price * 0.92, from: '0x8e...f2a1', time: '12 分鐘前', status: 'Active' },
    { id: 3, price: nft.price * 0.88, from: '0x4c...7b9d', time: '45 分鐘前', status: 'Expiring' },
  ];

  const sentimentScore = 75; // 0-100

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
              <img
                src={`https://picsum.photos/seed/${nft.symbol}/100/100`}
                alt={nft.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{nft.name}</h2>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getRarityColor(nft.rarity)}`}>
                  {nft.rarity}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">{nft.symbol}</p>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <p className="text-sm text-indigo-500 font-medium">{nft.type}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`p-2 rounded-lg transition-colors ${isWatchlisted ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Heart size={20} fill={isWatchlisted ? "currentColor" : "none"} />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
              <Share2 size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (4/12): Basic Info, Description, Traits, Utility */}
            <div className="lg:col-span-4 space-y-8">
              {/* Market Stats Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">當前地板價</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{nft.price.toLocaleString()} <span className="text-sm font-normal text-slate-400">CRDT</span></p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${priceChange >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">24h 最低</span>
                    <span className="text-slate-400">24h 最高</span>
                  </div>
                  <div className="relative w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 bg-indigo-500 rounded-full" 
                      style={{ left: '0%', width: `${pricePos}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-300">{low24h.toLocaleString()}</span>
                    <span className="text-slate-600 dark:text-slate-300">{high24h.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">24h 成交量</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{(nft.volume24h || nft.price * 15).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">持有者</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.floor(nft.totalSupply * 0.4).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  項目描述
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {nft.description}
                </p>
              </div>

              {/* Traits / Properties */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  屬性與特徵
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {nft.traits?.map((trait, i) => (
                    <div key={i} className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-indigo-400 uppercase font-bold mb-1">{trait.type}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{trait.value}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{trait.rarity}% 稀有度</p>
                    </div>
                  )) || (
                    <div className="col-span-2 py-4 text-center text-slate-400 text-xs italic">
                      暫無屬性資料
                    </div>
                  )}
                </div>
              </div>

              {/* Utility */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  賦能與用途
                </h3>
                <div className="space-y-2">
                  {nft.utility.map((u, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{u}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (8/12): Charts, Trading Status, Distribution */}
            <div className="lg:col-span-8 space-y-8">
              {/* Price & Volume Chart */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    價格與成交量 (24h)
                  </h3>
                  <div className="flex gap-2">
                    {['1h', '24h', '7d', '30d'].map(t => (
                      <button key={t} className={`px-2 py-1 text-[10px] font-bold rounded ${t === '24h' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#818cf8' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#6366f1" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[60px] w-full opacity-50">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeData}>
                        <Bar dataKey="volume" fill="#6366f1" radius={[2, 2, 0, 0]} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Trading Status (交易狀況) - Enhanced */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  交易狀況與深度
                </h3>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Market Depth (買賣盤) */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">市場深度 (Order Book)</span>
                      <Layers size={14} className="text-slate-400" />
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Asks (Sellers) */}
                      <div className="space-y-1">
                        {marketDepth.asks.reverse().map((ask, i) => (
                          <div key={i} className="relative flex justify-between text-[11px] py-1 px-2 group">
                            <div className="absolute inset-0 bg-rose-500/5 origin-right transition-transform" style={{ transform: `scaleX(${ask.total / 30})` }} />
                            <span className="relative text-rose-500 font-mono font-bold">{ask.price.toLocaleString()}</span>
                            <span className="relative text-slate-500">{ask.amount}</span>
                          </div>
                        ))}
                      </div>
                      {/* Spread */}
                      <div className="py-2 border-y border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-xs font-bold text-slate-400">價差: {(marketDepth.asks[0].price - marketDepth.bids[0].price).toFixed(2)} CRDT</span>
                      </div>
                      {/* Bids (Buyers) */}
                      <div className="space-y-1">
                        {marketDepth.bids.map((bid, i) => (
                          <div key={i} className="relative flex justify-between text-[11px] py-1 px-2 group">
                            <div className="absolute inset-0 bg-emerald-500/5 origin-right transition-transform" style={{ transform: `scaleX(${bid.total / 50})` }} />
                            <span className="relative text-emerald-500 font-mono font-bold">{bid.price.toLocaleString()}</span>
                            <span className="relative text-slate-500">{bid.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Activity & Offers Tabs */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/50">
                      <button 
                        onClick={() => setActivityTab('history')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activityTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        最近活動
                      </button>
                      <button 
                        onClick={() => setActivityTab('offers')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activityTab === 'offers' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        當前出價
                      </button>
                    </div>
                    
                    <div className="flex-1 max-h-[280px] overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                      {activityTab === 'history' ? (
                        recentTrades.map(trade => (
                          <div key={trade.id} className="px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  trade.type === '成交' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  trade.type === '掛單' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                  trade.type === '出價' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                  {trade.type}
                                </span>
                                {trade.isWhale && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-0.5">
                                    <Zap size={8} fill="currentColor" />
                                    大戶
                                  </span>
                                )}
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {trade.price > 0 ? `${trade.price.toLocaleString()} CRDT` : '---'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{trade.time}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1 text-slate-400">
                                <span>From:</span>
                                <span className="text-indigo-500 font-mono">{trade.from}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400">
                                <span>To:</span>
                                <span className="text-indigo-500 font-mono">{trade.to}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        activeOffers.map(offer => (
                          <div key={offer.id} className="px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {offer.price.toLocaleString()} CRDT
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                offer.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {offer.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <div className="flex items-center gap-1 text-slate-400">
                                <span>Bidder:</span>
                                <span className="text-indigo-500 font-mono">{offer.from}</span>
                              </div>
                              <span className="text-slate-400">{offer.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution & Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Market Circulation */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">市場流通</h4>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={circulationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {circulationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sentiment Gauge */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 w-full">市場情緒儀表</h4>
                  <div className="relative w-32 h-16 overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-slate-200 dark:border-slate-700" />
                    <div 
                      className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-indigo-500 transition-all duration-1000" 
                      style={{ 
                        clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)',
                        transform: `rotate(${(sentimentScore / 100) * 180 - 180}deg)` 
                      }} 
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{sentimentScore}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-bold">Greed</p>
                    </div>
                  </div>
                  <div className="flex justify-between w-full mt-2 px-4">
                    <span className="text-[8px] text-rose-500 font-bold">FEAR</span>
                    <span className="text-[8px] text-emerald-500 font-bold">GREED</span>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">綜合指標</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">流動性評級</span>
                      <span className="text-xs font-bold text-indigo-500">A+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">波動率</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{(nft.volatility * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">大戶持倉</span>
                      <span className="text-xs font-bold text-amber-500">穩定</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-indigo-600 rounded-xl p-3 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet size={16} className="opacity-70" />
                        <span className="text-[10px] font-bold">您的持有</span>
                      </div>
                      <span className="text-sm font-bold">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm"
          >
            關閉
          </button>
          <button className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
            立即交易
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
