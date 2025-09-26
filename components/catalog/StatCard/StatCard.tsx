'use client';

import { FC } from 'react';
import type { StatCardProps } from '@/types/catalog-stats';

export const StatCard: FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trend,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-3 animate-pulse w-32">
        <div className="h-8 w-8 bg-neutral-200 rounded mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-neutral-200 rounded w-32"></div>
      </div>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format numbers with Norwegian thousand separator
      return val.toLocaleString('nb-NO');
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-3 hover:shadow-medium transition-shadow duration-200 w-32">
      <div className="flex items-center justify-center mb-3">
        <div className="flex-shrink-0">{icon}</div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ml-auto ${
            trend === 'up' ? 'bg-semantic-success/10 text-semantic-success' :
            trend === 'down' ? 'bg-semantic-error/10 text-semantic-error' :
            'bg-neutral-100 text-neutral-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-600 mb-1 text-center">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 text-center">{formatValue(value)}</p>
      {subtext && (
        <p className="text-xs text-neutral-500 mt-1 text-center">{subtext}</p>
      )}
    </div>
  );
};