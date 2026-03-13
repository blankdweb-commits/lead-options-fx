import React, { useState } from 'react';
import { ChevronDown, TrendingUp, Search } from 'lucide-react';
import { ASSETS } from '../constants';

const AssetSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(ASSETS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = ASSETS.filter(asset => 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative mb-6">
      <button 
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
        }}
        className="w-full sm:w-auto flex items-center justify-between gap-4 bg-surface border border-zinc-700 hover:border-zinc-500 text-white px-5 py-3 rounded-xl transition-all shadow-lg"
      >
        <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-2 rounded-md">
                <TrendingUp size={20} className="text-accentOrange" />
            </div>
            <div className="text-left">
                <div className="font-bold text-lg leading-tight">{selected.symbol}</div>
                <div className="text-xs text-zinc-400">Forex Market</div>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/20">
                {selected.income}%
            </span>
            <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-surface border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-3 border-b border-zinc-800 bg-zinc-900/50">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Search asset..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 transition-colors placeholder:text-zinc-600"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                    <button
                    key={asset.symbol}
                    onClick={() => {
                        setSelected(asset);
                        setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0"
                    >
                    <span className="font-medium text-white">{asset.symbol}</span>
                    <span className="text-accentGreen font-bold text-sm">{asset.income}%</span>
                    </button>
                ))
            ) : (
                <div className="p-4 text-center text-xs text-zinc-500">
                    No assets found.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetSelector;