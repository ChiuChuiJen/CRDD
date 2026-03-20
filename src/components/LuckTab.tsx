import React, { useState } from 'react';
import { SimulationState, LuckEvent, calculateLuckOdds } from '../lib/simulation';
import { formatCurrency } from '../lib/format';
import { Coins, Clock, AlertCircle } from 'lucide-react';

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
  }
};

export function LuckTab({ state, lang }: LuckTabProps) {
  const t = translations[lang];
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'settled'>('active');

  const activeEvents = state.luckEvents.filter(e => e.status === 'active');
  const settledEvents = state.luckEvents.filter(e => e.status === 'settled');

  const renderEventCard = (event: LuckEvent) => {
    const isSettled = event.status === 'settled';
    const targetName = event.targetType === 'index' ? '加權指數 (Weighted Index)' : event.targetId;
    
    // Calculate current odds based on current target value
    let currentTargetValue = 0;
    if (event.targetType === 'index') {
      currentTargetValue = state.indexValue;
    } else {
      const coin = state.coins.find(c => c.id === event.targetId);
      if (coin) currentTargetValue = coin.price;
    }

    const odds = calculateLuckOdds(currentTargetValue, event.targetDigit);
    const smallOdds = odds.small;
    const largeOdds = odds.large;
    const zeroFiveOdds = odds.zero_five;

    // Generate mock betting data based on event ID and time
    let hash = 0;
    for (let i = 0; i < event.id.length; i++) {
      hash = ((hash << 5) - hash) + event.id.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);
    
    // Base volume between 1,000,000 and 10,000,000 CRDT
    const baseVolume = 1000000 + (seed % 9000000);
    
    // Progress from 0 to 1
    const progress = Math.min(1, Math.max(0, (state.currentTime - event.listDate) / (event.stopTradingDate - event.listDate)));
    
    // Total volume grows with progress
    const totalVolume = Math.floor(baseVolume * Math.pow(progress, 0.7));
    
    // Distribution percentages (should sum to 100)
    // We can use the seed to determine the bias, but also inversely correlate with odds
    // Lower odds = more people bet on it
    const invSmall = 1 / smallOdds;
    const invLarge = 1 / largeOdds;
    const invZeroFive = 1 / zeroFiveOdds;
    const sumInv = invSmall + invLarge + invZeroFive;
    
    // Add some noise based on seed
    const noise1 = (seed % 10) / 100; // 0 to 0.09
    const noise2 = ((seed >> 2) % 10) / 100;
    const noise3 = ((seed >> 4) % 10) / 100;
    
    const wSmall = (invSmall / sumInv) + noise1;
    const wLarge = (invLarge / sumInv) + noise2;
    const wZeroFive = (invZeroFive / sumInv) + noise3;
    const sumW = wSmall + wLarge + wZeroFive;
    
    const smallPct = (wSmall / sumW) * 100;
    const largePct = (wLarge / sumW) * 100;
    const zeroFivePct = (wZeroFive / sumW) * 100;

    return (
      <div key={event.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{event.id}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{targetName} - {event.targetDigit}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isSettled ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
          }`}>
            {isSettled ? t.settledEvents : t.activeEvents}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400">{t.listDate}</p>
            <p className="font-medium text-slate-900 dark:text-white">{new Date(event.listDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">{t.stopDate}</p>
            <p className="font-medium text-slate-900 dark:text-white">{new Date(event.stopTradingDate).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">{t.settleDate}</p>
            <p className="font-medium text-slate-900 dark:text-white">{new Date(event.settlementDate).toLocaleString()}</p>
          </div>
          {!isSettled && (
            <div>
              <p className="text-slate-500 dark:text-slate-400">{t.currentValue}</p>
              <p className="font-medium text-indigo-600 dark:text-indigo-400">{formatCurrency(currentTargetValue)}</p>
            </div>
          )}
          {isSettled && (
            <div>
              <p className="text-slate-500 dark:text-slate-400">{t.settlementValue}</p>
              <p className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(event.settlementValue || 0)}</p>
            </div>
          )}
        </div>

        {isSettled && event.winningOption && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              {t.winningOption}: {event.winningOption === 'small' ? t.small : event.winningOption === 'large' ? t.large : t.zeroFive}
            </p>
          </div>
        )}

        {!isSettled && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {state.currentTime < event.stopTradingDate ? t.currentOdds : t.finalOdds}
              </h4>
              {state.currentTime >= event.stopTradingDate && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[10px] font-bold rounded uppercase tracking-wider">
                  {t.locked}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                <div className="font-medium text-slate-700 dark:text-slate-300">{t.small}</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{smallOdds.toFixed(2)}x</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                <div className="font-medium text-slate-700 dark:text-slate-300">{t.zeroFive}</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{zeroFiveOdds.toFixed(2)}x</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                <div className="font-medium text-slate-700 dark:text-slate-300">{t.large}</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{largeOdds.toFixed(2)}x</div>
              </div>
            </div>
            
            {state.currentTime < event.stopTradingDate && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-3 mb-6">
                <AlertCircle size={14} />
                {t.oddsDisclaimer}
              </p>
            )}
          </div>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex justify-between items-end mb-4">
            <h4 className="font-medium text-slate-900 dark:text-white">{t.bettingStatus}</h4>
            <div className="text-sm">
              <span className="text-slate-500 dark:text-slate-400">{t.totalBetAmount}: </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalVolume)} CRDT</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{t.distribution}</span>
            </div>
            <div className="h-4 w-full flex rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 transition-all duration-500" 
                style={{ width: `${smallPct}%` }}
                title={`${t.small}: ${smallPct.toFixed(1)}%`}
              ></div>
              <div 
                className="bg-amber-500 transition-all duration-500" 
                style={{ width: `${zeroFivePct}%` }}
                title={`${t.zeroFive}: ${zeroFivePct.toFixed(1)}%`}
              ></div>
              <div 
                className="bg-rose-500 transition-all duration-500" 
                style={{ width: `${largePct}%` }}
                title={`${t.large}: ${largePct.toFixed(1)}%`}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">{t.small} ({smallPct.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-slate-600 dark:text-slate-400">{t.zeroFive} ({zeroFivePct.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-slate-600 dark:text-slate-400">{t.large} ({largePct.toFixed(1)}%)</span>
              </div>
            </div>
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

      <div className="space-y-4">
        {activeSubTab === 'active' ? (
          activeEvents.length > 0 ? (
            activeEvents.map(renderEventCard)
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t.noActive}</p>
            </div>
          )
        ) : (
          settledEvents.length > 0 ? (
            settledEvents.map(renderEventCard)
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t.noSettled}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
