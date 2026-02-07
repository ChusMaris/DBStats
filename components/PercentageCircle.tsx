import React from 'react';

interface Props {
  percentage: number; // 0 to 100
  size?: number;
}

export const PercentageCircle: React.FC<Props> = ({ percentage, size = 40 }) => {
  const radius = (size / 2) - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color interpolation: Red (0%) -> Yellow (50%) -> Green (100%)
  const getColor = (pct: number) => {
    if (pct < 50) return '#ef4444'; // Red
    if (pct < 75) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(percentage)}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-gray-700">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};