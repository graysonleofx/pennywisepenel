import { Transaction } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy, Edit, Trash2, Clock3, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionRow({ transaction, onEdit, onDelete }: TransactionRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return 'bg-success/20 text-success border-success/30';
      case 'withdrawal': return 'bg-warning/20 text-warning border-warning/30';
      case 'profit': return 'bg-primary/20 text-primary border-primary/30';
      case 'investment': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success';
      case 'pending': return 'bg-warning/20 text-warning';
      case 'failed': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const statusLabel = transaction.status === 'completed' ? 'Approved' : transaction.status === 'failed' ? 'Rejected' : 'Pending';
  const StatusIcon = transaction.status === 'completed' ? CheckCircle2 : transaction.status === 'failed' ? XCircle : Clock3;
  const copyId = async () => {
    try { await navigator.clipboard.writeText(transaction.id); } catch { /* clipboard may be unavailable */ }
  };

  return (
    <article className="group rounded-xl border border-border/70 bg-card p-4 shadow-sm-custom transition-all duration-200 hover:border-primary/40 hover:shadow-card animate-fade-in">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(180px,1.5fr)_minmax(120px,1fr)_minmax(135px,1fr)_minmax(120px,1fr)_auto] md:items-center md:gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", getTypeColor(transaction.type))}>
            {transaction.type === 'withdrawal' ? '−' : '+'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
            <p className="truncate text-xs text-muted-foreground">{transaction.description || `${transaction.type} transaction`}</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:block">
          <span className="text-xs text-muted-foreground md:block">Type</span>
          <Badge className={cn("mt-0 capitalize md:mt-1", getTypeColor(transaction.type))}>{transaction.type}</Badge>
        </div>

        <div className="flex items-center justify-between md:block">
          <span className="text-xs text-muted-foreground md:block">Status</span>
          <Badge className={cn("mt-0 inline-flex items-center gap-1 capitalize md:mt-1", getStatusColor(transaction.status))}><StatusIcon className="h-3 w-3" />{statusLabel}</Badge>
        </div>

        <div className="flex items-center justify-between md:block">
          <span className="text-xs text-muted-foreground md:block">Date</span>
          <p className="mt-0 text-sm text-foreground md:mt-1">{transaction.date}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3 md:border-0 md:pt-0">
          <button type="button" onClick={copyId} className="inline-flex min-h-10 min-w-0 items-center gap-2 text-left text-xs text-muted-foreground hover:text-primary" title="Copy transaction ID">
            <span className="max-w-28 truncate font-mono">{transaction.id}</span><Copy className="h-4 w-4 shrink-0" />
          </button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onEdit(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(transaction)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
