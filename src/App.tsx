import { useState, useEffect, useRef } from 'react';
import { parseCoins, parseEvents, Coin, MarketEvent, ImpactLevel } from './data/parser';
import { initializeSimulation, tickSimulation, SimulationState } from './lib/simulation';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CoinModal } from './components/CoinModal';
import { IndexModal } from './components/IndexModal';

export default function App() {
  const [state, setState] = useState<SimulationState | null>(null);
  const [events, setEvents] = useState<{ eventsA: MarketEvent[], eventsB: MarketEvent[], impacts: ImpactLevel[] } | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const parsedCoins = parseCoins();
    const parsedEvents = parseEvents();
    setState(initializeSimulation(parsedCoins));
    setEvents(parsedEvents);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (isRunning && state && events) {
      const interval = 1000 / speed;
      timerRef.current = setInterval(() => {
        setState(prev => prev ? tickSimulation(prev, events.eventsA, events.eventsB, events.impacts) : prev);
      }, interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speed, state, events]);

  useEffect(() => {
    let autoTimer: NodeJS.Timeout;
    if (isAuto && state && events) {
      autoTimer = setInterval(() => {
        setState(prev => {
          if (!prev) return prev;
          const currentDay = new Date(prev.currentTime).getDate();
          let nextState = prev;
          while (new Date(nextState.currentTime).getDate() === currentDay) {
            nextState = tickSimulation(nextState, events.eventsA, events.eventsB, events.impacts);
          }
          return nextState;
        });
      }, 2000 / speed);
    }
    return () => clearInterval(autoTimer);
  }, [isAuto, speed, events]);

  const handleNextDay = () => {
    if (!state || !events) return;
    const currentDay = new Date(state.currentTime).getDate();
    let nextState = state;
    // Tick until day changes
    while (new Date(nextState.currentTime).getDate() === currentDay) {
      nextState = tickSimulation(nextState, events.eventsA, events.eventsB, events.impacts);
    }
    setState(nextState);
  };

  if (!state) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <Header 
        state={state} 
        isRunning={isRunning} 
        setIsRunning={setIsRunning} 
        speed={speed} 
        setSpeed={setSpeed} 
        handleNextDay={handleNextDay}
        isAuto={isAuto}
        setIsAuto={setIsAuto}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onOpenIndexModal={() => setIsIndexModalOpen(true)}
      />
      <main className="container mx-auto p-4">
        <Dashboard state={state} lang={lang} onSelectCoin={setSelectedCoin} />
      </main>
      {selectedCoin && (
        <CoinModal 
          coin={state.coins.find(c => c.id === selectedCoin.id) || selectedCoin} 
          onClose={() => setSelectedCoin(null)} 
          lang={lang} 
          theme={theme}
        />
      )}
      {isIndexModalOpen && (
        <IndexModal 
          state={state}
          onClose={() => setIsIndexModalOpen(false)}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
}
