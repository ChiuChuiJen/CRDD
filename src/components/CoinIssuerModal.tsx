import React, { useState, useRef } from 'react';
import { X, Plus, Check, Download, Upload } from 'lucide-react';
import { SimulationState } from '../lib/simulation';

interface CoinIssuerModalProps {
  state: SimulationState;
  onClose: () => void;
  onIssue: (data: any) => void;
  onImport: (data: any[]) => void;
  lang: 'zh' | 'en';
}

export function CoinIssuerModal({ state, onClose, onIssue, onImport, lang }: CoinIssuerModalProps) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Others');
  const [issueType, setIssueType] = useState<'coin' | 'etf' | 'leveraged'>('coin');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [underlyingId, setUnderlyingId] = useState('');
  const [leverageFactor, setLeverageFactor] = useState('2');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = [
    'Layer 1', 'Payment', 'DeFi & Finance', 'GameFi', 'AI & Data', 
    'Meme', 'Privacy & Security', 'Storage & Data', 'Energy & Environment', 
    'Metaverse', 'Infrastructure', 'Others'
  ];

  const LEVERAGE_OPTIONS = [
    { label: 'Long 2x', value: '2' },
    { label: 'Long 3x', value: '3' },
    { label: 'Long 5x', value: '5' },
    { label: 'Short 1x', value: '-1' },
    { label: 'Short 2x', value: '-2' },
    { label: 'Short 3x', value: '-3' },
    { label: 'Short 5x', value: '-5' },
  ];

  const t = {
    zh: {
      title: '發行新資產',
      name: '名稱',
      symbol: '代號',
      price: '初始價格 (CRDT)',
      supply: '發行量',
      category: '類別',
      desc: '介紹',
      type: '資產類型',
      typeCoin: '普通貨幣',
      typeETF: 'ETF',
      typeLeveraged: '槓桿代幣',
      underlying: '標的資產',
      leverage: '槓桿倍數',
      components: '選擇成分幣',
      submit: '確認發行',
      cancel: '取消',
      note: '註：新資產將於發行日後 2 天正式上市交易。',
      export: '匯出',
      import: '匯入',
      importError: '匯入失敗，請檢查檔案格式',
    },
    en: {
      title: 'Issue New Asset',
      name: 'Name',
      symbol: 'Symbol',
      price: 'Initial Price (CRDT)',
      supply: 'Total Supply',
      category: 'Category',
      desc: 'Description',
      type: 'Asset Type',
      typeCoin: 'Normal Coin',
      typeETF: 'ETF',
      typeLeveraged: 'Leveraged Token',
      underlying: 'Underlying Asset',
      leverage: 'Leverage Factor',
      components: 'Select Components',
      submit: 'Issue',
      cancel: 'Cancel',
      note: 'Note: The new asset will start trading 2 days after issuance.',
      export: 'Export',
      import: 'Import',
      importError: 'Import failed, please check file format',
    }
  }[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !initialPrice || !totalSupply) return;
    if (issueType === 'etf' && selectedComponents.length === 0) return;
    if (issueType === 'leveraged' && !underlyingId) return;

    onIssue({
      name,
      symbol: symbol.toUpperCase(),
      initialPrice: parseFloat(initialPrice),
      totalSupply: parseFloat(totalSupply),
      description,
      category: issueType === 'etf' ? 'ETF' : (issueType === 'leveraged' ? 'Leveraged' : category),
      isETF: issueType === 'etf',
      isLeveraged: issueType === 'leveraged',
      leverageFactor: issueType === 'leveraged' ? parseFloat(leverageFactor) : undefined,
      underlyingId: issueType === 'leveraged' ? underlyingId : undefined,
      components: issueType === 'etf' ? selectedComponents : undefined
    });
  };

  const toggleComponent = (coinId: string) => {
    setSelectedComponents(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    );
  };

  const handleExport = () => {
    const customCoins = state.coins.filter(c => c.isCustom).map(c => ({
      name: c.name,
      symbol: c.symbol,
      initialPrice: c.initialPrice,
      totalSupply: c.totalSupply,
      description: c.description,
      category: c.category,
      isETF: c.isETF,
      components: c.components
    }));
    
    const blob = new Blob([JSON.stringify(customCoins, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_coins.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
        } else {
          alert(t.importError);
        }
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const availableCoins = state.coins.filter(c => !c.isETF);

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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.type}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setIssueType('coin')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    issueType === 'coin'
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.typeCoin}
                </button>
                <button
                  type="button"
                  onClick={() => setIssueType('etf')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    issueType === 'etf'
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.typeETF}
                </button>
                <button
                  type="button"
                  onClick={() => setIssueType('leveraged')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    issueType === 'leveraged'
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.typeLeveraged}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.name}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                placeholder={issueType === 'etf' ? "e.g. Top 10 Crypto Index" : (issueType === 'leveraged' ? "e.g. BTC Long 3x" : "e.g. Bitcoin")}
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
                placeholder={issueType === 'etf' ? "e.g. TOP10" : (issueType === 'leveraged' ? "e.g. BTC3L" : "e.g. BTC")}
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

            {issueType === 'coin' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {issueType === 'leveraged' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.underlying}</label>
                  <select
                    value={underlyingId}
                    onChange={e => setUnderlyingId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Underlying</option>
                    {availableCoins.map(coin => (
                      <option key={coin.id} value={coin.id}>{coin.symbol} - {coin.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.leverage}</label>
                  <select
                    value={leverageFactor}
                    onChange={e => setLeverageFactor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  >
                    {LEVERAGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {issueType === 'etf' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.components}</label>
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 p-2 space-y-1">
                  {availableCoins.map(coin => (
                    <div 
                      key={coin.id}
                      onClick={() => toggleComponent(coin.id)}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedComponents.includes(coin.id) 
                          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                          : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{coin.symbol}</span>
                        <span className="text-xs opacity-70">{coin.name}</span>
                      </div>
                      {selectedComponents.includes(coin.id) && <Check size={16} />}
                    </div>
                  ))}
                </div>
                {selectedComponents.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one component.</p>
                )}
              </div>
            )}

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

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={handleImportClick}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={t.import}
            >
              <Upload size={16} />
              <span className="hidden sm:inline">{t.import}</span>
            </button>
            <button 
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={t.export}
            >
              <Download size={16} />
              <span className="hidden sm:inline">{t.export}</span>
            </button>
          </div>
          <div className="flex gap-3">
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
              disabled={(issueType === 'etf' && selectedComponents.length === 0) || (issueType === 'leveraged' && !underlyingId)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {t.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
