import React, { useState } from 'react';
import { NFT, NFT_CATEGORIES } from '../data/parser';
import { Search, Filter, ArrowUpRight, ArrowDownRight, Info, User, Tag, Layers } from 'lucide-react';

interface NFTTabProps {
  nfts: NFT[];
  onSelectNFT: (nft: NFT) => void;
}

const NFTTab: React.FC<NFTTabProps> = ({ nfts, onSelectNFT }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         nft.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || nft.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'UR': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'SSR': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'SR': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋 NFT 名稱或代號..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
            }`}
          >
            全部
          </button>
          {NFT_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNFTs.map(nft => {
          const priceChange = nft.dailyHistory.length > 0 
            ? ((nft.price - nft.dailyHistory[nft.dailyHistory.length - 1].open) / nft.dailyHistory[nft.dailyHistory.length - 1].open) * 100
            : 0;

          return (
            <div
              key={nft.id}
              onClick={() => onSelectNFT(nft)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Placeholder Image */}
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${nft.symbol}/400/400`}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </span>
                  {nft.isFractionalized && (
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800">
                      碎片化 1:{nft.fractionRatio}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate flex-1">
                      {nft.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      #{nft.symbol.split('-').pop()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {nft.type}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                      當前價格
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {nft.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">CRDT</span>
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${priceChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {priceChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(priceChange).toFixed(2)}%
                  </div>
                </div>

                <div className="pt-3 border-top border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{nft.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>供應量: {nft.totalSupply}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNFTs.length === 0 && (
        <div className="py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">未找到符合條件的 NFT</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">請嘗試更換搜尋關鍵字或分類</p>
        </div>
      )}
    </div>
  );
};

export default NFTTab;
