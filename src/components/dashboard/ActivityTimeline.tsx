import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle, User, DollarSign, TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export interface ActivityItem {
  id: string;
  type: 'deposit_approved' | 'deposit_rejected' | 'deposit_pending' | 'user_created' | 'withdrawal_requested' | 'investment_created';
  message: string;
  amount?: number | string;
  userName?: string;
  timestamp: string;
  userId?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'deposit_approved':
      return { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' };
    case 'deposit_rejected':
      return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' };
    case 'deposit_pending':
      return { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' };
    case 'user_created':
      return { icon: User, color: 'text-info', bg: 'bg-info/10' };
    case 'withdrawal_requested':
      return { icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10' };
    case 'investment_created':
      return { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' };
    default:
      return { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted/10' };
  }
};

const getActivityEmoji = (type: string) => {
  switch (type) {
    case 'deposit_approved':
      return '🟢';
    case 'deposit_rejected':
      return '🔴';
    case 'deposit_pending':
      return '🟠';
    case 'user_created':
      return '👤';
    case 'withdrawal_requested':
      return '💸';
    case 'investment_created':
      return '📈';
    default:
      return '•';
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  isLoading = false,
  maxItems = 6,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayActivities.length === 0) {
    return <EmptyState title="No activity yet" description="Recent activities will appear here" />;
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => {
        const { icon: Icon, color, bg } = getActivityIcon(activity.type);
        const timeAgo = getTimeAgo(new Date(activity.timestamp));

        return (
          <div key={activity.id} className="flex gap-4 pb-4">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`p-2 rounded-full ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              {index < displayActivities.length - 1 && (
                <div className="w-0.5 h-12 bg-border my-2" />
              )}
            </div>

            {/* Activity content */}
            <div className="flex-1 pt-1">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-foreground font-medium text-sm">{activity.message}</p>
                {activity.amount && (
                  <p className="text-primary font-semibold text-sm">${activity.amount}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
              {activity.userName && (
                <p className="text-xs text-muted-foreground mt-1">{activity.userName}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
}
