import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface CoinIssuerModalProps {
  onClose: () => void;
  onIssue: (data: any) => void;
  lang: 'zh' | 'en';
}

export function CoinIssuerModal({ onClose, onIssue, lang }: CoinIssuerModalProps) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [description, setDescription] = useState('');

  const t = {
    zh: {
      title: '發行新貨幣',
      name: '貨幣名稱',
      symbol: '代號',
      price: '初始價格 (CRDT)',
      supply: '發行量',
      desc: '貨幣介紹',
      submit: '確認發行',
      cancel: '取消',
      note: '註：新貨幣將於發行日後 2 天正式上市交易。'
    },
    en: {
      title: 'Issue New Coin',
      name: 'Coin Name',
      symbol: 'Symbol',
      price: 'Initial Price (CRDT)',
      supply: 'Total Supply',
      desc: 'Description',
      submit: 'Issue Coin',
      cancel: 'Cancel',
      note: 'Note: The new coin will start trading 2 days after issuance.'
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !initialPrice || !totalSupply) return;

    onIssue({
      name,
      symbol: symbol.toUpperCase(),
      initialPrice: parseFloat(initialPrice),
      totalSupply: parseFloat(totalSupply),
      description
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="text-indigo-500" />
            {t.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="issue-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.name}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g. Bitcoin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.symbol}</label>
              <input 
                type="text" 
                required
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white uppercase"
                placeholder="e.g. BTC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.price}</label>
              <input 
                type="number" 
                required
                min="0.00000001"
                step="any"
                value={initialPrice}
                onChange={e => setInitialPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g. 50000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.supply}</label>
              <input 
                type="number" 
                required
                min="1"
                value={totalSupply}
                onChange={e => setTotalSupply(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder="e.g. 21000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.desc}</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none"
                rows={3}
              ></textarea>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-sm text-indigo-600 dark:text-indigo-400">
            {t.note}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button 
            type="submit"
            form="issue-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
