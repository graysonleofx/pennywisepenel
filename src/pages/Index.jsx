import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UserCard } from '@/components/dashboard/UserCard';
import { TransactionRow } from '@/components/dashboard/TransactionRow';
import { UserEditModal } from '@/components/dashboard/UserEditModal';
import { UserDetailModal } from '@/components/dashboard/UserDetailModal';
import { mockUsers, mockTransactions } from '@/data/mockData';
// import { User, Transaction } from '@/types/user';
import { Users, DollarSign, TrendingUp, ArrowDownUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [users, setUsers] = useState(mockUsers);
  const [transactions] = useState(mockTransactions);
  const [searchValue, setSearchValue] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const { toast } = useToast();

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const totalProfit = users.reduce((sum, user) => sum + user.totalProfit, 0);
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
  };

  const handleDeleteUser = (user) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    toast({
      title: "User Deleted",
      description: `${user.fullName} has been removed.`,
    });
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    toast({
      title: "User Updated",
      description: `${updatedUser.fullName}'s data has been saved.`,
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
    user.email.toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 4);

  return (
    <DashboardLayout 
      title="Dashboard" 
      searchValue={searchValue} 
      onSearchChange={setSearchValue}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={users.length}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Transactions"
          value={transactions.length}
          icon={ArrowDownUp}
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Users</h3>
            <a href="/users" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onView={handleViewUser}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <a href="/transactions" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="grid gap-3">
            {recentTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={() => toast({ title: "Edit Transaction", description: "Feature coming soon!" })}
                onDelete={() => toast({ title: "Delete Transaction", description: "Feature coming soon!" })}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Modals */}
      <UserEditModal
        user={editingUser}
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />
      <UserDetailModal
        user={viewingUser}
        open={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />
    </DashboardLayout>
  );
};

export default Index;
