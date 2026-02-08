import React, { useEffect, useState } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  userImage: string;
  balance: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, userImage, balance }) => {
  const [prevBalance, setPrevBalance] = useState(balance);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
      if (balance !== prevBalance) {
          setHighlight(true);
          const timer = setTimeout(() => setHighlight(false), 500);
          setPrevBalance(balance);
          return () => clearTimeout(timer);
      }
  }, [balance, prevBalance]);

  return (
    <header className="h-16 lg:h-20 bg-surface/90 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
            <h1 className="text-accentOrange font-black text-lg lg:text-2xl tracking-tighter leading-none">
                LEAD OPTIONS
            </h1>
            <span className="text-[9px] lg:text-[10px] text-zinc-500 font-medium tracking-[0.2em] hidden sm:block">
                PROFESSIONAL TRADING
            </span>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        
        {/* Balance Display - Highly visible on mobile */}
        <div className="flex flex-col items-end mr-1">
          <span className="text-[10px] text-zinc-500 mb-0.5 hidden sm:block">Live Account</span>
          <span className={`text-accentOrange font-bold text-base lg:text-xl font-mono tracking-tight transition-all duration-300 ${highlight ? 'scale-110 text-white' : ''}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
          </span>
        </div>
        
        {/* Deposit Button - Condensed on Mobile */}
        <button className="bg-accentGreen hover:bg-green-600 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 active:scale-95">
          <Plus size={18} />
          <span className="hidden sm:inline">Deposit</span>
        </button>
        
        {/* Notification Bell (Visual only for now) */}
        <button className="hidden sm:flex p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <Bell size={20} />
        </button>

        {/* User Profile */}
        <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-zinc-700 border-2 border-zinc-800 overflow-hidden cursor-pointer hover:border-accentOrange transition-colors shadow-lg">
            <img src={userImage} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
};

export default Header;