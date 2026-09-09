import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

type StatusType = 'pending' | 'approved' | 'rejected' | 'processing';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label,
  size = 'md'
}) => {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-warning/10 text-warning border border-warning/20',
      dotColor: 'bg-warning'
    },
    approved: {
      icon: CheckCircle,
      label: 'Approved',
      className: 'bg-success/10 text-success border border-success/20',
      dotColor: 'bg-success'
    },
    rejected: {
      icon: XCircle,
      label: 'Rejected',
      className: 'bg-destructive/10 text-destructive border border-destructive/20',
      dotColor: 'bg-destructive'
    },
    processing: {
      icon: AlertCircle,
      label: 'Processing',
      className: 'bg-info/10 text-info border border-info/20',
      dotColor: 'bg-info'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full font-medium ${config.className} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      <span>{label || config.label}</span>
    </div>
  );
};
