import { Play, Pause, FastForward, SkipForward, Moon, Sun, Globe, RefreshCw, Activity, Plus } from 'lucide-react';
import { SimulationState } from '../lib/simulation';

interface HeaderProps {
  state: SimulationState;
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  handleNextDay: () => void;
  isAuto: boolean;
  setIsAuto: (v: boolean) => void;
  lang: 'zh' | 'en';
  setLang: (v: 'zh' | 'en') => void;
  theme: 'dark' | 'light';
  setTheme: (v: 'dark' | 'light') => void;
  onOpenIndexModal: () => void;
  onOpenIssuerModal: () => void;
}

export function Header({
  state, isRunning, setIsRunning, speed, setSpeed, handleNextDay, isAuto, setIsAuto, lang, setLang, theme, setTheme, onOpenIndexModal, onOpenIssuerModal
}: HeaderProps) {
  const t = {
    zh: {
      title: 'CR虛擬貨幣交易所',
      index: '加權指數',
      start: '開始模擬',
      pause: '暫停',
      speed: '速度倍率',
      nextDay: '下一日',
      auto: '自動進程',
      issue: '發行貨幣',
    },
    en: {
      title: 'CR Crypto Exchange',
      index: 'Weighted Index',
      start: 'Start Sim',
      pause: 'Pause',
      speed: 'Speed',
      nextDay: 'Next Day',
      auto: 'Auto Next',
      issue: 'Issue Coin',
    }
  }[lang];

  const date = new Date(state.currentTime);
  const indexStartValue = state.indexDailyHistory && state.indexDailyHistory.length > 0 
    ? state.indexDailyHistory[state.indexDailyHistory.length - 1].open 
    : 10000;
  const indexChange = state.indexValue - indexStartValue;
  const indexChangePercent = (indexChange / indexStartValue) * 100;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent">
      <div className="max-w-8xl mx-auto">
        <div className="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 px-4">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                {t.title}
              </h1>
              <div 
                className="hidden md:flex flex-col cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 p-2 -m-2 rounded-lg transition-colors"
                onClick={onOpenIndexModal}
              >
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  {t.index} <Activity size={12} className="text-indigo-500" />
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-mono font-semibold">{state.indexValue.toFixed(2)}</span>
                  <span className={`text-sm font-mono ${indexChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {indexChange >= 0 ? '+' : ''}{indexChange.toFixed(2)} ({indexChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">Time</span>
                <span className="text-sm font-mono">{date.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isRunning ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                <span className="hidden sm:inline">{isRunning ? t.pause : t.start}</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-md p-1">
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 text-xs font-medium rounded ${speed === s ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNextDay}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-sm font-medium transition-colors"
              >
                <SkipForward size={16} />
                <span className="hidden sm:inline">{t.nextDay}</span>
              </button>

              <button 
                onClick={() => setIsAuto(!isAuto)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isAuto ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'}`}
              >
                <RefreshCw size={16} className={isAuto ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{t.auto}</span>
              </button>

              <button 
                onClick={onOpenIssuerModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t.issue}</span>
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

              <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <Globe size={18} />
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
