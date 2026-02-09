import React, { useState, useEffect } from 'react';
import { STATS_DATA } from '../constants';
import StatCard from './StatCard';
import TradingChart from './TradingChart';
import AssetSelector from './AssetSelector';
import { StatData } from '../types';
import { TrendingUp, TrendingDown, Activity, Zap, RefreshCw } from 'lucide-react';

interface DashboardProps {
    financials: {
        balance: number;
        profit: number;
        activeTrades: number;
        totalWon: number;
        totalLost: number;
        isCrashed: boolean;
    };
    setFinancials: React.Dispatch<React.SetStateAction<{
        balance: number;
        profit: number;
        activeTrades: number;
        totalWon: number;
        totalLost: number;
        isCrashed: boolean;
    }>>;
}

const Dashboard: React.FC<DashboardProps> = ({ financials, setFinancials }) => {
  const [displayStats, setDisplayStats] = useState<StatData[]>(STATS_DATA);
  const [botStatus, setBotStatus] = useState<'active' | 'paused'>('active');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [lastTradeResult, setLastTradeResult] = useState<{ type: 'win' | 'loss' | 'neutral', amount: number, asset: string } | null>(null);
  const [tradeHistory, setTradeHistory] = useState<Array<{time: string, asset: string, result: 'win' | 'loss', amount: number}>>([]);

  // Map of assets with current prices
  const [assetPrices, setAssetPrices] = useState({
    EURUSD: 1.0850,
    GBPUSD: 1.2650,
    USDJPY: 148.50,
    BTCUSD: 42500,
  });

  // Generate random trade
  const generateRandomTrade = () => {
    const assets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'BTC/USD'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const isWin = Math.random() > 0.45; // 55% win rate when not crashed
    const amount = financials.isCrashed 
      ? -(Math.random() * 500 + 100) // Always lose when crashed
      : isWin 
        ? Math.random() * 300 + 50 
        : -(Math.random() * 200 + 30);
    
    const resultType = amount > 0 ? 'win' : 'loss';
    
    // Update financials
    setFinancials(prev => ({
      ...prev,
      balance: prev.balance + amount,
      profit: prev.profit + amount,
      activeTrades: prev.activeTrades > 0 ? prev.activeTrades - 1 : 0,
      totalWon: amount > 0 ? prev.totalWon + 1 : prev.totalWon,
      totalLost: amount < 0 ? prev.totalLost + 1 : prev.totalLost,
    }));

    // Record last trade
    setLastTradeResult({
      type: resultType,
      amount: Math.abs(amount),
      asset
    });

    // Add to trade history
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setTradeHistory(prev => {
      const newHistory = [{
        time: timeString,
        asset,
        result: resultType,
        amount: Math.abs(amount)
      }, ...prev.slice(0, 4)]; // Keep only last 5 trades
      return newHistory;
    });

    // Update asset prices
    setAssetPrices(prev => ({
      EURUSD: prev.EURUSD + (Math.random() - 0.5) * 0.001,
      GBPUSD: prev.GBPUSD + (Math.random() - 0.5) * 0.001,
      USDJPY: prev.USDJPY + (Math.random() - 0.5) * 0.3,
      BTCUSD: prev.BTCUSD + (Math.random() - 0.5) * 200,
    }));

    // Occasionally open new trades
    if (Math.random() > 0.7 && !financials.isCrashed) {
      setFinancials(prev => ({
        ...prev,
        activeTrades: prev.activeTrades + 1
      }));
    }
  };

  // Simulation interval based on speed
  useEffect(() => {
    if (!isSimulating || botStatus === 'paused' || financials.isCrashed) return;

    const intervals = {
      slow: 3000,
      normal: 1500,
      fast: 800
    };

    const interval = setInterval(generateRandomTrade, intervals[simulationSpeed]);
    return () => clearInterval(interval);
  }, [isSimulating, botStatus, financials.isCrashed, simulationSpeed]);

  // Auto-start simulation on component mount
  useEffect(() => {
    setIsSimulating(true);
  }, []);

  // Update stats display
  useEffect(() => {
    const updatedStats = STATS_DATA.map(stat => {
      let newValue: string | number = stat.value;
      
      if (stat.id === '1') { // Capital
        newValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.balance - financials.profit);
      } else if (stat.id === '2') { // Profit
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

  // Calculate win rate
  const winRate = financials.totalWon + financials.totalLost > 0 
    ? Math.round((financials.totalWon / (financials.totalWon + financials.totalLost)) * 100)
    : 0;

  // Calculate buy/sell pressure dynamically
  const buyPressure = financials.isCrashed ? 5 : Math.max(30, Math.min(80, 50 + (financials.profit / 10000)));
  const sellPressure = 100 - buyPressure;

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const toggleBot = () => {
    setBotStatus(prev => prev === 'active' ? 'paused' : 'active');
  };

  const handleSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    setSimulationSpeed(speed);
  };

  // Manually trigger a trade
  const triggerManualTrade = () => {
    if (!financials.isCrashed) {
      generateRandomTrade();
    }
  };

  // Reset to default values
  const resetFinancials = () => {
    setFinancials({
      balance: 250500.00,
      profit: 250000.00,
      activeTrades: 12,
      totalWon: 30,
      totalLost: 8,
      isCrashed: false
    });
    setTradeHistory([]);
    setLastTradeResult(null);
  };

  return (
    <main className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {financials.isCrashed && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl flex items-center justify-center font-bold animate-pulse">
              ⚠️ WARNING: MARGIN CALL TRIGGERED. ACCOUNT LIQUIDATED. CONTACT SUPPORT.
          </div>
      )}

      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isSimulating ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : 'border-green-500/50 text-green-400 hover:bg-green-500/10'}`}
          >
            <Activity size={16} />
            {isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
          </button>
          
          <div className="flex items-center gap-2 bg-zinc-900/50 rounded-lg p-1 border border-zinc-800">
            {(['slow', 'normal', 'fast'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${simulationSpeed === speed ? 'bg-accentOrange text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {speed.charAt(0).toUpperCase() + speed.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerManualTrade}
            disabled={financials.isCrashed || botStatus === 'paused'}
            className="flex items-center gap-2 px-4 py-2 bg-accentGreen/10 text-accentGreen border border-accentGreen/30 rounded-lg hover:bg-accentGreen/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={16} />
            Trigger Trade
          </button>
          
          <button
            onClick={resetFinancials}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-all"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </div>

      {/* Last Trade Notification */}
      {lastTradeResult && (
        <div className={`p-4 rounded-xl border ${lastTradeResult.type === 'win' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} animate-in slide-in-from-right-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {lastTradeResult.type === 'win' ? (
                <TrendingUp className="text-green-500" size={24} />
              ) : (
                <TrendingDown className="text-red-500" size={24} />
              )}
              <div>
                <p className="font-bold text-white">
                  {lastTradeResult.type === 'win' ? 'WINNING TRADE!' : 'LOSING TRADE'}
                </p>
                <p className="text-sm text-zinc-400">
                  {lastTradeResult.asset} • {lastTradeResult.type === 'win' ? '+' : '-'}${lastTradeResult.amount.toFixed(2)}
                </p>
              </div>
            </div>
            <span className={`text-sm font-bold ${lastTradeResult.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
              {lastTradeResult.type === 'win' ? 'PROFIT' : 'LOSS'}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {displayStats.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </section>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Win Rate</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{winRate}%</p>
              <p className="text-sm text-zinc-400 mt-2">
                {financials.totalWon} wins • {financials.totalLost} losses
              </p>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#333"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${winRate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{winRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Live Asset Prices</h3>
          <div className="space-y-3">
            {Object.entries(assetPrices).map(([asset, price]) => {
              const change = (Math.random() - 0.5) * 0.5;
              const priceNumber = price as number; // Type assertion since we know it's a number
              return (
                <div key={asset} className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">{asset}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">
                      {asset.includes('USD') && !asset.includes('BTC') ? '$' : ''}
                      {priceNumber.toFixed(asset.includes('USD') && !asset.includes('BTC') ? 4 : 2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${change >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface border border-zinc-800 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Recent Trades</h3>
          <div className="space-y-3">
            {tradeHistory.length > 0 ? (
              tradeHistory.map((trade, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${trade.result === 'win' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-zinc-300">{trade.asset}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${trade.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.result === 'win' ? '+' : '-'}${trade.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">{trade.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No trades yet. Start the simulation!</p>
            )}
          </div>
        </div>
      </div>

      {/* Trading Section */}
      <section className="mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
           <div className="flex-1 min-w-0">
              <AssetSelector />
              <TradingChart />
           </div>
           
           {/* Bot Activity Sidebar */}
           <div className="hidden xl:block w-80 space-y-4 shrink-0">
              <div className="bg-surface border border-zinc-800 rounded-xl p-6 h-full flex flex-col shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-white font-bold text-lg">Trading Bot</h3>
                     <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                         <div className="relative flex h-2.5 w-2.5">
                            {botStatus === 'active' && !financials.isCrashed && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${botStatus === 'active' && !financials.isCrashed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                         </div>
                         <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                           {botStatus === 'active' && !financials.isCrashed ? 'RUNNING' : 'STOPPED'}
                         </span>
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
                                className={`h-full transition-all duration-500 ease-in-out relative ${
                                    financials.isCrashed 
                                        ? 'w-[5%] bg-green-900/30' 
                                        : 'bg-gradient-to-r from-green-600 via-green-500 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                }`}
                                style={{ width: `${buyPressure}%` }}
                            >
                                {!financials.isCrashed && (
                                    <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-[shimmer_2s_infinite] -translate-x-full"></div>
                                )}
                            </div>
                            
                            {/* Sell Bar */}
                            <div 
                                className={`h-full transition-all duration-500 ease-in-out relative ${
                                    financials.isCrashed 
                                        ? 'w-[95%] bg-gradient-to-l from-red-600 via-red-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                                        : 'bg-red-900/20'
                                }`}
                                style={{ width: `${sellPressure}%` }}
                            >
                                 {financials.isCrashed && (
                                    <div className="absolute inset-0 bg-white/20 skew-x-12 animate-[shimmer_1s_infinite] -translate-x-full"></div>
                                )}
                            </div>
                        </div>

                         <div className="flex justify-between text-sm font-bold pt-1">
                            <span className={`transition-colors duration-500 ${financials.isCrashed ? 'text-zinc-600' : 'text-accentGreen'}`}>
                                {Math.round(buyPressure)}%
                            </span>
                            <span className={`transition-colors duration-500 ${financials.isCrashed ? 'text-accentRed' : 'text-zinc-600'}`}>
                                {Math.round(sellPressure)}%
                            </span>
                        </div>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800 flex-1">
                         <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Signals</h4>
                         <div className="space-y-3">
                             {['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'BTC/USD'].map((asset, i) => {
                               const signal = Math.random() > (financials.isCrashed ? 0.8 : 0.5) ? 'BUY' : 'SELL';
                               const strength = Math.random() > 0.7 ? 'STRONG ' : '';
                               return (
                                 <div key={asset} className="flex items-center justify-between text-sm animate-in slide-in-from-right-2" style={{ animationDelay: `${i * 100}ms` }}>
                                     <div className="flex items-center gap-2">
                                         <span className={`w-1.5 h-1.5 rounded-full ${signal === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                         <span className="text-zinc-300 font-medium">{asset}</span>
                                     </div>
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                         signal === 'BUY' 
                                         ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                         : 'bg-red-500/10 text-red-500 border-red-500/20'
                                     }`}>
                                         {strength}{signal}
                                     </span>
                                 </div>
                               );
                             })}
                         </div>
                  </div>

                  <button 
                    onClick={toggleBot}
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