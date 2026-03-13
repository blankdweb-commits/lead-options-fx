import React from 'react';
import * as LucideIcons from 'lucide-react';
import { StatData } from '../types';

interface StatCardProps {
  data: StatData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  // Dynamically get icon component
  const IconComponent = LucideIcons[data.iconName] as React.ElementType;

  const getColorClass = (accent: string) => {
    switch (accent) {
      case 'green': return 'text-accentGreen';
      case 'red': return 'text-accentRed';
      case 'orange': return 'text-accentOrange';
      default: return 'text-white';
    }
  };

  const getIconBgClass = (accent: string) => {
    switch (accent) {
      case 'green': return 'bg-accentGreen/10 text-accentGreen';
      case 'red': return 'bg-accentRed/10 text-accentRed';
      case 'orange': return 'bg-accentOrange/10 text-accentOrange';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="bg-surface border border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-zinc-700 transition-colors duration-200">
      <div>
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">
          {data.label}
        </p>
        <h3 className={`text-xl font-bold ${getColorClass(data.accentColor)}`}>
          {data.value}
        </h3>
      </div>
      <div className={`p-3 rounded-lg ${getIconBgClass(data.accentColor)}`}>
        {IconComponent && <IconComponent size={20} />}
      </div>
    </div>
  );
};

export default StatCard;