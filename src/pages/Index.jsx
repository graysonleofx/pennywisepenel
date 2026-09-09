import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatisticCard } from '@/components/dashboard/StatisticCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { PendingDepositsPreview } from '@/components/dashboard/PendingDepositsPreview';
import { dashboardService } from '@/services/dashboardService.js';
import { depositsService } from '@/services/depositsService';
import { activityService } from '@/services/activityService';
import { LoadingState } from '@/components/ui/LoadingState';
import { Users, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalProfit: 0,
    totalTransactions: 0,
  });
  const [depositStats, setDepositStats] = useState({
    totalDeposits: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, depositStatsData, pendingDepositsData, activitiesData, recentUsersData] = await Promise.all([
        dashboardService.getStats(),
        depositsService.getDepositStats(),
        depositsService.getPendingDeposits(),
        activityService.getAllActivityLogs(10),
        dashboardService.getRecentUsers(5),
      ]);

      setStats(statsData);
      setDepositStats(depositStatsData);
      setPendingDeposits(pendingDepositsData);
      setActivities(activitiesData);
      setRecentUsers(recentUsersData);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" hideSearch>
        <LoadingState title="Loading Dashboard" description="Fetching your data..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" hideSearch>
      {/* Welcome Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-foreground md:text-3xl">
          Good morning, Admin
        </h1>
        <p className="text-muted-foreground">
          Monitor your platform performance and manage pending requests.
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:mb-8">
        <StatisticCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers}
          change={12.5}
          changeLabel="from last month"
          type="primary"
        />
        <StatisticCard
          icon={DollarSign}
          label="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          change={8.2}
          changeLabel="from last month"
          type="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Pending Deposits Section */}
        <div className="lg:col-span-2">
          <div className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Pending Deposits</h3>
                <p className="text-sm text-muted-foreground mt-1">Requiring action</p>
              </div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-warning/10 text-warning font-bold text-lg">
                {depositStats.pendingCount}
              </div>
            </div>
            <PendingDepositsPreview
              deposits={pendingDeposits}
              maxItems={5}
            />
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="space-y-4">
          <div className="premium-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Deposit Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="font-semibold text-success">{depositStats.approvedCount}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-semibold text-warning">{depositStats.pendingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <span className="font-semibold text-destructive">{depositStats.rejectedCount}</span>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Pending Amount</h3>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(depositStats.pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting approval
            </p>
          </div>
        </div>
      </div>

      {/* Recent Users and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="premium-card mb-6 lg:mb-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Users</h3>
            <a href="/users" className="text-sm text-primary hover:text-primary/80 transition-colors">
              View all →
            </a>
          </div>

          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.fullName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">
                      ${user.accountBalance || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.country || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No users yet
            </p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
            <a href="/activity-logs" className="text-sm text-primary hover:text-primary/80 transition-colors">
              View all →
            </a>
          </div>

          <ActivityTimeline activities={activities} maxItems={6} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
