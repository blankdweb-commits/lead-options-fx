import React from 'react';
import * as LucideIcons from 'lucide-react';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentView, onNavigate, onLogout }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-surface border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area (Visible on mobile drawer only, mostly for branding alignment) */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 lg:hidden">
             <span className="text-accentOrange font-bold text-xl tracking-tight">LEAD OPTIONS FX</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = LucideIcons[item.iconName] as React.ElementType;
              const isActive = currentView === item.label;
              
              return (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.label)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-accentOrange text-white shadow-lg shadow-orange-900/20' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                  `}
                >
                  {Icon && <Icon size={20} />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white w-full transition-colors group"
            >
              <LucideIcons.LogOut size={20} className="group-hover:text-accentRed transition-colors" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;