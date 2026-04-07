import { Transaction } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
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

  return (
    <div className="bg-card rounded-lg p-4 card-shadow border border-border/50 transition-all duration-300 hover:border-primary/30 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge className={cn("capitalize", getTypeColor(transaction.type))}>
            {transaction.type}
          </Badge>
          <div>
            <p className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <Badge className={cn("capitalize text-xs", getStatusColor(transaction.status))}>
              {transaction.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
          </div>
          
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
    </div>
  );
}
