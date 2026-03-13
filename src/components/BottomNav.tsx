import React from 'react';
import * as LucideIcons from 'lucide-react';
import { NAV_ITEMS } from '../constants';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-zinc-800 lg:hidden z-50 px-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const Icon = LucideIcons[item.iconName] as React.ElementType;
          const isActive = currentView === item.label;

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.label)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-accentOrange' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {Icon && <Icon size={20} />}
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-accentOrange rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
