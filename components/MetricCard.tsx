
import React from 'react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, unit }) => {
  return (
    <div className="glass p-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105">
      <div className="p-3 bg-slate-800 rounded-xl text-indigo-400">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
