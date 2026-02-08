import React, { useState, useEffect } from 'react';
import { STATS_DATA } from '../constants';
import StatCard from './StatCard';
import TradingChart from './TradingChart';
import AssetSelector from './AssetSelector';
import { StatData } from '../types';

interface DashboardProps {
    financials: {
        balance: number;
        profit: number;
        activeTrades: number;
        totalWon: number;
        totalLost: number;
        isCrashed: boolean;
    };
}

const Dashboard: React.FC<DashboardProps> = ({ financials }) => {
  // We merge global financials with the static configuration (icons, labels)
  const [displayStats, setDisplayStats] = useState<StatData[]>(STATS_DATA);
  const [botStatus, setBotStatus] = useState<'active' | 'paused'>('active');

  useEffect(() => {
      // Map global state to the stats array format
      const updatedStats = STATS_DATA.map(stat => {
          let newValue = stat.value;
          
          if (stat.id === '2') { // Profit
             newValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.profit);
          } else if (stat.id === '3') { // Balance
             newValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.balance);
          } else if (stat.id === '4') { // Trades
             newValue = financials.activeTrades;
          } else if (stat.id === '5') { // Won
             newValue = financials.totalWon;
          } else if (stat.id === '6') { // Lost
             newValue = financials.totalLost;
          }

          return { ...stat, value: newValue };
      });
      setDisplayStats(updatedStats);
  }, [financials]);

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {financials.isCrashed && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl flex items-center justify-center font-bold animate-pulse">
              WARNING: MARGIN CALL TRIGGERED. ACCOUNT LIQUIDATED CONTACT SUPPORT. 
          </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {displayStats.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </section>

      {/* Trading Section */}
      <section className="mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
           <div className="flex-1 min-w-0">
              <AssetSelector />
              <TradingChart />
           </div>
           
           {/* Recent Activity / Sidebar */}
           <div className="hidden xl:block w-80 space-y-4 shrink-0">
              <div className="bg-surface border border-zinc-800 rounded-xl p-6 h-full flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-white font-bold text-lg">Bot Activity</h3>
                     <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                         <div className="relative flex h-2.5 w-2.5">
                            {botStatus === 'active' && !financials.isCrashed && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${botStatus === 'active' && !financials.isCrashed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         </div>
                         <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">{botStatus === 'active' && !financials.isCrashed ? 'Running' : 'Stopped'}</span>
                     </div>
                  </div>

                  <div className="space-y-5 mb-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-zinc-400">
                            <span className={!financials.isCrashed ? "text-green-400" : "text-zinc-600"}>Buy Pressure</span>
                            <span className={financials.isCrashed ? "text-red-400" : "text-zinc-600"}>Sell Pressure</span>
                        </div>
                        
                        <div className="h-3 bg-zinc-900 rounded-full overflow-hidden flex w-full border border-zinc-800/50 shadow-inner relative">
                            {/* Buy Bar */}
                            <div 
                                className={`h-full transition-all duration-1000 ease-in-out relative ${
                                    financials.isCrashed 
                                        ? 'w-[5%] bg-green-900/30' 
                                        : 'w-[68%] bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                }`}
                            >
                                {!financials.isCrashed && (
                                    <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                )}
                            </div>
                            
                            {/* Sell Bar */}
                            <div 
                                className={`h-full transition-all duration-1000 ease-in-out relative ${
                                    financials.isCrashed 
                                        ? 'w-[95%] bg-gradient-to-l from-red-600 via-red-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                        : 'w-[32%] bg-red-900/20'
                                }`}
                            >
                                 {financials.isCrashed && (
                                    <div className="absolute inset-0 bg-white/20 skew-x-12 animate-[shimmer_1s_infinite] -translate-x-full"></div>
                                )}
                            </div>
                        </div>

                         <div className="flex justify-between text-sm font-bold pt-1">
                            <span className={`transition-colors duration-500 ${financials.isCrashed ? 'text-zinc-600' : 'text-accentGreen'}`}>
                                {financials.isCrashed ? '5%' : '68%'}
                            </span>
                            <span className={`transition-colors duration-500 ${financials.isCrashed ? 'text-accentRed' : 'text-zinc-600'}`}>
                                {financials.isCrashed ? '95%' : '32%'}
                            </span>
                        </div>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 flex-1">
                         <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Signals</h4>
                         <div className="space-y-3">
                             {[1,2,3,4,5].map(i => (
                                 <div key={i} className="flex items-center justify-between text-sm animate-in slide-in-from-right-2" style={{ animationDelay: `${i * 100}ms` }}>
                                     <div className="flex items-center gap-2">
                                         <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                         <span className="text-zinc-300 font-medium">EUR/USD</span>
                                     </div>
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                         financials.isCrashed 
                                         ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                         : i % 2 === 0 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                     }`}>
                                         {financials.isCrashed ? 'STRONG SELL' : i % 2 === 0 ? 'STRONG BUY' : 'SELL'}
                                     </span>
                                 </div>
                             ))}
                         </div>
                  </div>

                  <button 
                    onClick={() => setBotStatus(prev => prev === 'active' ? 'paused' : 'active')}
                    disabled={financials.isCrashed}
                    className={`w-full py-3 rounded-xl text-xs font-bold mt-6 border transition-all shadow-lg active:scale-[0.98] ${
                        botStatus === 'active' && !financials.isCrashed
                        ? 'border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 hover:text-red-300 shadow-red-900/10' 
                        : 'border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 hover:text-green-300 shadow-green-900/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                    }`}
                  >
                      {botStatus === 'active' && !financials.isCrashed ? 'STOP AUTO-TRADING' : 'RESUME AUTO-TRADING'}
                  </button>
              </div>
           </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;