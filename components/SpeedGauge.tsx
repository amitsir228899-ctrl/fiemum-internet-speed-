
import React, { useMemo } from 'react';

interface SpeedGaugeProps {
  value: number;
  label: string;
  unit: string;
  isActive: boolean;
  colorClass: string;
}

const SpeedGauge: React.FC<SpeedGaugeProps> = ({ value, label, unit, isActive, colorClass }) => {
  const maxSpeed = 500;
  // Map value to rotation (from -120deg to 120deg for a 240deg arc)
  const rotation = useMemo(() => {
    const clampedValue = Math.min(value, maxSpeed);
    return (clampedValue / maxSpeed) * 240 - 120;
  }, [value]);

  const percentage = Math.min((value / maxSpeed) * 100, 100);
  
  // SVG Constants
  const size = 320;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 4) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // 240 degree arc offset
  const arcLength = (240 / 360) * circumference;
  const dashOffset = arcLength - (percentage / 100) * arcLength;

  // Generate tick marks
  const ticks = useMemo(() => {
    const items = [];
    for (let i = 0; i <= 10; i++) {
      const angle = (i / 10) * 240 - 210; // Start at -210deg relative to 0deg (3 o'clock)
      const isMajor = i % 2 === 0;
      items.push({ angle, isMajor, label: isMajor ? (i * (maxSpeed / 10)).toString() : '' });
    }
    return items;
  }, [maxSpeed]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className={`relative w-80 h-80 transition-all duration-700 ${isActive ? 'scale-105' : 'scale-100'}`}>
        {/* The Gauge SVG */}
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-0">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            style={{ transformOrigin: 'center', transform: 'rotate(150deg)' }}
          />

          {/* Active Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{ 
                transformOrigin: 'center', 
                transform: 'rotate(150deg)',
                filter: isActive ? 'url(#glow)' : 'none'
            }}
          />

          {/* Tick Marks */}
          {ticks.map((tick, i) => (
            <g key={i} transform={`rotate(${tick.angle}, ${center}, ${center})`}>
              <line
                x1={center + radius - (tick.isMajor ? 15 : 8)}
                y1={center}
                x2={center + radius + 5}
                y2={center}
                stroke={tick.isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={tick.isMajor ? 3 : 2}
              />
              {tick.label && (
                <text
                  x={center + radius - 35}
                  y={center}
                  fill="#64748b"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${-tick.angle}, ${center + radius - 35}, ${center})`}
                >
                  {tick.label}
                </text>
              )}
            </g>
          ))}

          {/* Needle Base (Hub) */}
          <circle cx={center} cy={center} r="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle cx={center} cy={center} r="4" fill="#f8fafc" />

          {/* The Needle */}
          <g style={{ 
            transformOrigin: 'center', 
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.17, 0.67, 0.45, 1.32)' 
          }}>
            <path
              d={`M ${center - 6} ${center} L ${center} ${center - radius + 10} L ${center + 6} ${center} Z`}
              fill="#f8fafc"
              filter="drop-shadow(0 0 4px rgba(255,255,255,0.5))"
            />
          </g>
        </svg>

        {/* Digital Readout - Positioned slightly lower than center to look natural in the arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-center pointer-events-none">
          <div className="flex flex-col items-center">
             <span className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">{label}</span>
             <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-xl">
                    {value.toFixed(1)}
                </span>
             </div>
             <span className="text-sm font-bold text-slate-500 mt-1">{unit}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Glow Pulse */}
      <div className={`absolute -inset-8 opacity-10 blur-[80px] rounded-full transition-opacity duration-1000 pointer-events-none ${isActive ? 'opacity-30' : 'opacity-0'} ${colorClass.replace('stroke-', 'bg-')}`} />
    </div>
  );
};

export default SpeedGauge;
