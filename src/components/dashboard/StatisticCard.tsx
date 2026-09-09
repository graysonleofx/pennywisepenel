import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

type StatType = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface StatisticCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  type?: StatType;
  onClick?: () => void;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  changeLabel = 'from last month',
  type = 'primary',
  onClick,
  loading = false,
  trend = 'up',
}) => {
  const typeStyles = {
    primary: 'stat-card-primary',
    success: 'stat-card-success',
    warning: 'stat-card-warning',
    danger: 'stat-card-danger',
    info: 'stat-card-info',
  };

  const typeIconColor = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
    info: 'text-info',
  };

  const isPositive = trend === 'up';
  const trendColor = isPositive ? 'text-success' : 'text-destructive';

  return (
    <div
      onClick={onClick}
      className={`${typeStyles[type]} premium-card cursor-pointer group ${
        onClick ? 'hover:shadow-card' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className={`p-3 rounded-lg bg-background/50 group-hover:bg-background transition-colors ${typeIconColor[type]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trendColor}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        {loading ? (
          <div className="h-8 w-20 rounded bg-background/50 animate-pulse" />
        ) : (
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">{value}</h3>
        )}

        {change !== undefined && (
          <p className="text-xs text-muted-foreground pt-2">
            {isPositive ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
          </p>
        )}
      </div>
    </div>
  );
};
