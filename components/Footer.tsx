import React, { useState, useEffect } from 'react';
import { CheckCircle2, Signal } from 'lucide-react';

interface FooterProps {
    serviceFee: number;
}

const Footer: React.FC<FooterProps> = ({ serviceFee }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-zinc-800 p-3 lg:px-8 flex items-center justify-between z-40 text-xs lg:text-sm shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2 text-accentGreen">
          <CheckCircle2 size={16} />
          <span className="font-semibold">Auto-Trade: Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-zinc-400">
           <Signal size={16} />
           <span>Signal Fee: <span className="text-white font-mono">{formatCurrency(serviceFee)}</span></span>
        </div>
      </div>

      <div className="font-mono text-zinc-400">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
    </div>
  );
};

export default Footer;