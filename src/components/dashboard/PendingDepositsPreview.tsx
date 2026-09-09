import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';

export interface PendingDeposit {
  id: string;
  userId: string;
  userName?: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  submittedDate: string;
  status: 'pending';
}

interface PendingDepositsPreviewProps {
  deposits: PendingDeposit[];
  isLoading?: boolean;
  maxItems?: number;
}

export const PendingDepositsPreview: React.FC<PendingDepositsPreviewProps> = ({
  deposits,
  isLoading = false,
  maxItems = 5,
}) => {
  const navigate = useNavigate();
  const displayDeposits = deposits.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-background/50 rounded-lg animate-pulse">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="w-12 h-6 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (displayDeposits.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No Pending Deposits"
        description="All deposit requests have been processed"
      />
    );
  }

  return (
    <div className="space-y-2">
      {displayDeposits.map((deposit) => (
        <div
          key={deposit.id}
          onClick={() => navigate('/pending-approvals')}
          className="flex items-center justify-between p-4 bg-background/50 hover:bg-background rounded-lg transition-colors cursor-pointer border border-border hover:border-primary/50 group"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {deposit.userName || 'User'}
              </h4>
              <span className="text-success font-bold text-sm flex-shrink-0">
                ${deposit.amount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {deposit.paymentMethod} • {deposit.reference}
            </p>
          </div>

          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            <StatusBadge status="pending" size="sm" />
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      ))}

      {deposits.length > maxItems && (
        <Button
          variant="outline"
          onClick={() => navigate('/pending-approvals')}
          className="w-full mt-2"
        >
          View All Pending ({deposits.length})
        </Button>
      )}
    </div>
  );
};
