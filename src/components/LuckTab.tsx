import React, { useState } from 'react';
import { SimulationState, LuckEvent, calculateLuckOdds } from '../lib/simulation';
import { formatCurrency } from '../lib/format';
import { Coins, Clock, AlertCircle, X, Info, TrendingUp, DollarSign } from 'lucide-react';

interface LuckTabProps {
  state: SimulationState;
  lang: 'zh' | 'en';
}

const translations = {
  zh: {
    doubleDragon: '雙龍鬥',
    activeEvents: '進行中',
    settledEvents: '已結算',
    target: '標的',
    targetDigit: '猜測位數',
    listDate: '上架時間',
    stopDate: '停止交易',
    settleDate: '結算時間',
    status: '狀態',
    currentOdds: '當前倍率',
    oddsDisclaimer: '註：此為當下預估倍率，實際倍率依照結算日當下快照為主。',
    bettingStatus: '全網投注狀況',
    totalBetAmount: '總投注金額',
    distribution: '分布',
    finalOdds: '最終倍率',
    locked: '已鎖定',
    amount: '金額',
    small: '小 (1-4)',
    large: '大 (6-9)',
    zeroFive: '0或5',
    odds: '賠率',
    betSuccess: '下注成功！',
    balance: '餘額',
    noActive: '目前沒有進行中的活動',
    noSettled: '目前沒有已結算的活動',
    settlementValue: '結算值',
    currentValue: '目前數值',
    winningOption: '獲勝選項',
    myBets: '我的下注',
    totalWinnings: '總獎金',
    details: '詳細資訊',
    close: '關閉',
  },
  en: {
    doubleDragon: 'Double Dragon Duel',
    activeEvents: 'Active',
    settledEvents: 'Settled',
    target: 'Target',
    targetDigit: 'Target Digit',
    listDate: 'List Date',
    stopDate: 'Stop Trading',
    settleDate: 'Settle Date',
    status: 'Status',
    currentOdds: 'Current Odds',
    oddsDisclaimer: 'Note: These are current estimated odds. Actual odds are based on the snapshot at the settlement date.',
    bettingStatus: 'Global Betting Status',
    totalBetAmount: 'Total Bet Amount',
    distribution: 'Distribution',
    finalOdds: 'Final Odds',
    locked: 'Locked',
    amount: 'Amount',
    small: 'Small (1-4)',
    large: 'Large (6-9)',
    zeroFive: '0 or 5',
    odds: 'Odds',
    betSuccess: 'Bet placed successfully!',
    balance: 'Balance',
    noActive: 'No active events',
    noSettled: 'No settled events',
    settlementValue: 'Settlement Value',
    currentValue: 'Current Value',
    winningOption: 'Winning Option',
    myBets: 'My Bets',
    totalWinnings: 'Total Winnings',
    details: 'Details',
    close: 'Close',
  }
};

export function LuckTab({ state, lang }: LuckTabProps) {
  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'settled'>('active');
  const [selectedEvent, setSelectedEvent] = useState<LuckEvent | null>(null);

  const activeEvents = state.luckEvents.filter(e => e.status === 'active');
  const settledEvents = state.luckEvents.filter(e => 
    e.status === 'settled' && 
    (state.currentTime - (e.settlementDate || 0)) < 60 * 24 * 60 * 60 * 1000
  );

  const getEventData = (event: LuckEvent) => {
    const targetName = event.targetType === 'index' ? (lang === 'zh' ? '加權指數' : 'Weighted Index') : event.targetId;
    
    let currentTargetValue = 0;
    if (event.targetType === 'index') {
      currentTargetValue = state.indexValue;
    } else {
      const coin = state.coins.find(c => c.id === event.targetId);
      if (coin) currentTargetValue = coin.price;
    }

    const odds = calculateLuckOdds(currentTargetValue, event.targetDigit);
    
    let hash = 0;
    for (let i = 0; i < event.id.length; i++) {
      hash = ((hash << 5) - hash) + event.id.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    const baseVolume = 1000000 + (seed % 9000000);
    const progress = Math.min(1, Math.max(0, (state.currentTime - event.listDate) / (event.stopTradingDate - event.listDate)));
    const totalVolume = Math.floor(baseVolume * Math.pow(progress, 0.7));
    
    const invSmall = 1 / odds.small;
    const invLarge = 1 / odds.large;
    const invZeroFive = 1 / odds.zero_five;
    const sumInv = invSmall + invLarge + invZeroFive;
    const noise1 = (seed % 10) / 100;
    const noise2 = ((seed >> 2) % 10) / 100;
    const noise3 = ((seed >> 4) % 10) / 100;
    const wSmall = (invSmall / sumInv) + noise1;
    const wLarge = (invLarge / sumInv) + noise2;
    const wZeroFive = (invZeroFive / sumInv) + noise3;
    const sumW = wSmall + wLarge + wZeroFive;
    
    return {
      targetName,
      currentTargetValue,
      odds,
      totalVolume,
      smallPct: (wSmall / sumW) * 100,
      largePct: (wLarge / sumW) * 100,
      zeroFivePct: (wZeroFive / sumW) * 100
    };
  };

  const renderEventSmallCard = (event: LuckEvent) => {
    const isSettled = event.status === 'settled';
    const { targetName, currentTargetValue, odds } = getEventData(event);

    return (
      <div 
        key={event.id} 
        onClick={() => setSelectedEvent(event)}
        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">{event.id}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{targetName}</p>
          </div>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isSettled ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
          }`}>
            {isSettled ? t.settledEvents : t.activeEvents}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.small}</div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{odds.small.toFixed(2)}x</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.zeroFive}</div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{odds.zero_five.toFixed(2)}x</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t.large}</div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{odds.large.toFixed(2)}x</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[10px]">
          <span className="text-slate-500 dark:text-slate-400">{isSettled ? t.settlementValue : t.currentValue}</span>
          <span className={`font-mono font-bold ${isSettled ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
            {formatCurrency(isSettled ? event.settlementValue || 0 : currentTargetValue)}
          </span>
        </div>
      </div>
    );
  };

  const renderEventModal = () => {
    if (!selectedEvent) return null;
    const event = selectedEvent;
    const isSettled = event.status === 'settled';
    const { targetName, currentTargetValue, odds, totalVolume, smallPct, largePct, zeroFivePct } = getEventData(event);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}></div>
        <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Info className="text-indigo-500" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{event.id}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{targetName} - {event.targetDigit}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.listDate}</p>
                <p className="font-medium text-slate-900 dark:text-white">{new Date(event.listDate).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.stopDate}</p>
                <p className="font-medium text-slate-900 dark:text-white">{new Date(event.stopTradingDate).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t.settleDate}</p>
                <p className="font-medium text-slate-900 dark:text-white">{new Date(event.settlementDate).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{isSettled ? t.settlementValue : t.currentValue}</p>
                <p className={`font-bold text-lg ${isSettled ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                  {formatCurrency(isSettled ? event.settlementValue || 0 : currentTargetValue)}
                </p>
              </div>
            </div>

            {isSettled && event.winningOption && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-800/60 dark:text-emerald-300/60 font-medium uppercase tracking-wider">{t.winningOption}</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {event.winningOption === 'small' ? t.small : event.winningOption === 'large' ? t.large : t.zeroFive}
                  </p>
                </div>
                <TrendingUp className="text-emerald-500" size={32} />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {isSettled ? t.finalOdds : (state.currentTime < event.stopTradingDate ? t.currentOdds : t.finalOdds)}
                </h4>
                {state.currentTime >= event.stopTradingDate && !isSettled && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold rounded uppercase tracking-wider">
                    {t.locked}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.small}</div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{odds.small.toFixed(2)}x</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.zeroFive}</div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{odds.zero_five.toFixed(2)}x</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.large}</div>
                  <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{odds.large.toFixed(2)}x</div>
                </div>
              </div>
              {!isSettled && state.currentTime < event.stopTradingDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {t.oddsDisclaimer}
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-end mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-indigo-500" size={18} />
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.bettingStatus}</h4>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t.totalBetAmount}: </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalVolume)} CRDT</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-4 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <div className="bg-blue-500 transition-all duration-500" style={{ width: `${smallPct}%` }}></div>
                  <div className="bg-amber-500 transition-all duration-500" style={{ width: `${zeroFivePct}%` }}></div>
                  <div className="bg-rose-500 transition-all duration-500" style={{ width: `${largePct}%` }}></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t.small}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{smallPct.toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t.zeroFive}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{zeroFivePct.toFixed(1)}%</span>
                  </div>
                  <div className="flex flex-col p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{t.large}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{largePct.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Coins className="text-indigo-500" />
          {t.doubleDragon}
        </h2>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'active'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {t.activeEvents} ({activeEvents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('settled')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === 'settled'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          {t.settledEvents} ({settledEvents.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSubTab === 'active' ? (
          activeEvents.length > 0 ? (
            activeEvents.map(renderEventSmallCard)
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t.noActive}</p>
            </div>
          )
        ) : (
          settledEvents.length > 0 ? (
            settledEvents.map(renderEventSmallCard)
          ) : (
            <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t.noSettled}</p>
            </div>
          )
        )}
      </div>

      {renderEventModal()}
    </div>
  );
}
