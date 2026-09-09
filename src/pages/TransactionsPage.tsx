import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionRow } from '@/components/dashboard/TransactionRow';
import { mockTransactions, mockUsers } from '@/data/mockData';
import { Transaction } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ClipboardList, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchValue, setSearchValue] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 8;

  const handleEditTransaction = (transaction: Transaction) => {
    toast({
      title: "Edit Transaction",
      description: "Transaction editing coming soon!",
    });
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (!window.confirm(`Delete transaction ${transaction.id}? This action cannot be undone.`)) return;
    setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    toast({
      title: "Transaction Deleted",
      description: "Transaction has been removed.",
    });
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.fullName || 'Unknown User';
  };

  const filteredTransactions = useMemo(() => transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      getUserName(transaction.userId).toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  }), [transactions, searchValue, filterType]);
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const visibleTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const updateFilter = (type: string) => { setFilterType(type); setCurrentPage(1); };

  const types = ['all', 'deposit', 'withdrawal', 'profit', 'investment'] as const;

  return (
    <DashboardLayout 
      title="Transactions" 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
    >
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              onClick={() => updateFilter(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
        <Button className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 text-sm">
        <div><p className="font-medium text-foreground">Transaction activity</p><p className="text-xs text-muted-foreground">{filteredTransactions.length} record{filteredTransactions.length === 1 ? '' : 's'} found</p></div>
        <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted-foreground sm:inline-flex">Page {currentPage} of {totalPages}</span>
      </div>

      <div className="space-y-3">
        {visibleTransactions.map((transaction) => (
          <div key={transaction.id}>
            <p className="text-xs text-muted-foreground mb-2 ml-2">
              {getUserName(transaction.userId)}
            </p>
            <TransactionRow
              transaction={transaction}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium text-foreground">No transactions found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or transaction type.</p>
        </div>
      )}

      {filteredTransactions.length > 0 && <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Page {currentPage} of {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(page => page - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(page => page + 1)}>Next</Button>
        </div>
      </div>}
    </DashboardLayout>
  );
};

export default TransactionsPage;
