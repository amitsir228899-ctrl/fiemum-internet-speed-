
import React from 'react';
import { AIAnalysis } from '../types';

interface AIInsightsProps {
  analysis: AIAnalysis | null;
  isLoading: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass p-8 rounded-3xl mt-8 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-4/6"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const statusColors = {
    excellent: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    good: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    average: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    poor: 'text-rose-400 border-rose-400/30 bg-rose-400/10'
  };

  return (
    <div className="glass p-8 rounded-3xl mt-8 border-l-4 border-indigo-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/>
            </svg>
        </div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Network Insights</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusColors[analysis.status]}`}>
          {analysis.status}
        </span>
      </div>
      
      <p className="text-slate-300 leading-relaxed mb-6 italic">
        "{analysis.explanation}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
                <span className="text-indigo-500 mt-1">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-slate-800/50 p-4 rounded-2xl flex flex-col justify-center">
            <div className="text-xs text-indigo-300 font-bold mb-1">PRO TIP</div>
            <p className="text-xs text-slate-400">
                Wired Ethernet connections can reduce latency by up to 40% compared to WiFi. Consider using a cable for competitive gaming or large file transfers.
            </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
