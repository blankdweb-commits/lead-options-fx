import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MOCK_CHART_DATA } from '../constants';
import { ArrowUp, ArrowDown, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close > data.open;
    return (
      <div className="bg-surface border border-zinc-700 p-3 rounded shadow-xl">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <div className="flex gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">O</span>
            <span className="font-mono">{data.open.toFixed(5)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">H</span>
            <span className="font-mono">{data.high.toFixed(5)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">L</span>
            <span className="font-mono">{data.low.toFixed(5)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs">C</span>
            <span className={`font-mono ${isUp ? 'text-green-500' : 'text-red-500'}`}>
              {data.close.toFixed(5)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const prepareCandleData = (data: any[]) => {
  return data.map(d => ({
    ...d,
    body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    wick: [d.low, d.high],
    color: d.close > d.open ? '#22c55e' : '#ef4444'
  }));
};

const TradingChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1m');
  const [chartData, setChartData] = useState(prepareCandleData(MOCK_CHART_DATA));
  const [currentPrice, setCurrentPrice] = useState(MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1].close);

  // Live Market Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevData => {
        const newData = [...prevData];
        const lastIndex = newData.length - 1;
        const lastCandle = { ...newData[lastIndex] };
        
        // Random Walk Logic
        const volatility = 0.00015;
        const change = (Math.random() - 0.5) * volatility;
        let newClose = lastCandle.close + change;
        
        // Update High/Low boundaries
        if (newClose > lastCandle.high) lastCandle.high = newClose;
        if (newClose < lastCandle.low) lastCandle.low = newClose;
        
        lastCandle.close = newClose;
        
        // Update visual properties
        lastCandle.body = [Math.min(lastCandle.open, newClose), Math.max(lastCandle.open, newClose)];
        lastCandle.wick = [lastCandle.low, lastCandle.high];
        lastCandle.color = newClose > lastCandle.open ? '#22c55e' : '#ef4444';

        newData[lastIndex] = lastCandle;
        setCurrentPrice(newClose);
        return newData;
      });
    }, 800); // Update price every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface border border-zinc-800 rounded-xl p-4 lg:p-6 shadow-lg h-[450px] flex flex-col relative overflow-hidden">
      {/* Live Price Indicator (Top Right Overlay) */}
      <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
         <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg px-3 py-1.5 shadow-lg">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-white font-mono font-bold text-lg">{currentPrice.toFixed(5)}</span>
         </div>
         <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Real-time Data</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-800 rounded text-zinc-400">
                <Activity size={18} />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white leading-none">Market Chart</h3>
                <span className="text-xs text-zinc-500 uppercase font-medium">EUR/USD • Forex</span>
            </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800 mr-24">
          {['1m', '5m', '15m', '1h', '4h'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                timeframe === t 
                  ? 'bg-zinc-700 text-white shadow' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
                dataKey="time" 
                stroke="#52525b" 
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
            />
            <YAxis 
                domain={['auto', 'auto']} 
                orientation="right" 
                stroke="#52525b"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.toFixed(5)}
                width={60}
            />
            <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#52525b', strokeDasharray: '4 4', strokeWidth: 1 }}
                isAnimationActive={false}
            />
             
             {/* Wick Layer - Thin bar from Low to High */}
             <Bar 
                dataKey="wick"
                fill="#52525b"
                barSize={1}
                isAnimationActive={false}
             >
                 {chartData.map((entry, index) => (
                    <Cell key={`wick-${index}`} fill={entry.color} />
                ))}
             </Bar>

             {/* Body Layer - Bar from Min(Open, Close) to Max(Open, Close) */}
             <Bar 
                dataKey="body" 
                barSize={8}
                isAnimationActive={false}
             >
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
             </Bar>

          </ComposedChart>
        </ResponsiveContainer>
      </div>

       {/* Action Buttons */}
       <div className="flex gap-4 mt-6">
        <button className="flex-1 bg-accentGreen hover:bg-green-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <ArrowUp size={24} />
            CALL
        </button>
        <button className="flex-1 bg-accentRed hover:bg-red-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            <ArrowDown size={24} />
            PUT
        </button>
      </div>
    </div>
  );
};

export default TradingChart;