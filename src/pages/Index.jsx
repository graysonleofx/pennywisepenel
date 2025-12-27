import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { UserCard } from '@/components/dashboard/UserCard.jsx';
import { TransactionRow } from '@/components/dashboard/TransactionRow';
import { UserEditModal } from '@/components/dashboard/UserEditModal.jsx';
import { UserDetailModal } from '@/components/dashboard/UserDetailModal.jsx';
import { dashboardService } from '@/services/dashboardService.js';
import { Users, DollarSign, TrendingUp, ArrowDownUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle search
  useEffect(() => {
    if (!loading && searchValue.trim()) {
      handleSearch();
    } else if (!searchValue.trim() && !loading) {
      fetchDashboardData();
    }
  }, [searchValue]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentUsers(5),
        // dashboardService.getRecentTransactions(5),
      ]);

      setStats(statsData);
      setUsers(usersData);
      // setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const allUsers = await dashboardService.getAllUsers(searchValue);
      setUsers(allUsers.slice(0, 4));
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive',
      });
    }
  };

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

  const handleDeleteUser = async (user) => {
    try {
      await dashboardService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast({
        title: "User Deleted",
        description: `${user.fullName} has been removed.`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const { id, ...dataToUpdate } = updatedUser;
      await dashboardService.updateUser(id, dataToUpdate);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: `${updatedUser.fullName}'s data has been saved.`,
      });
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout 
        title="Dashboard" 
        searchValue={searchValue} 
        onSearchChange={setSearchValue}
      >
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

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
          value={stats.totalUsers}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(stats.totalProfit)}
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
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onView={handleViewUser}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No users found</p>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
            <a href="/transactions" className="text-sm text-primary hover:underline">View all</a>
          </div>
          <div className="grid gap-3">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => toast({ title: "Edit Transaction", description: "Feature coming soon!" })}
                  onDelete={() => toast({ title: "Delete Transaction", description: "Feature coming soon!" })}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No transactions found</p>
            )}
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
