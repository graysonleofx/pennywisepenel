import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionRow } from '@/components/dashboard/TransactionRow';
import { useFirebaseTransactions } from '@/hooks/useFirebaseTransactions';
import { useFirebaseUsers } from '@/hooks/useFirebaseUsers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TransactionsPage = () => {
  const { transactions, loading: txLoading, deleteTransaction } = useFirebaseTransactions();
  const { users, loading: usersLoading } = useFirebaseUsers();
  const [searchValue, setSearchValue] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const handleEditTransaction = () => {
    toast({
      title: "Edit Transaction",
      description: "Transaction editing coming soon!",
    });
  };

  const handleDeleteTransaction = async (transaction: { id: string }) => {
    await deleteTransaction(transaction.id);
    toast({
      title: "Transaction Deleted",
      description: "Transaction has been removed.",
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || 'Unknown User';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      getUserName(transaction.userId).toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  const types = ['all', 'deposit', 'withdrawal', 'profit', 'investment'] as const;

  const isLoading = txLoading || usersLoading;

  if (isLoading) {
    return (
      <DashboardLayout title="Transactions" searchValue="" onSearchChange={() => {}}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading transactions...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Transactions" 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Badge
              key={type}
              variant={filterType === type ? "default" : "outline"}
              className={cn(
                "cursor-pointer capitalize transition-all",
                filterType === type 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-primary/10 border-border text-muted-foreground"
              )}
              onClick={() => setFilterType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div key={transaction.id}>
            <p className="text-xs text-muted-foreground mb-2 ml-2">
              {getUserName(transaction.userId)}
            </p>
            <TransactionRow
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={() => handleDeleteTransaction(transaction)}
            />
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TransactionsPage;
