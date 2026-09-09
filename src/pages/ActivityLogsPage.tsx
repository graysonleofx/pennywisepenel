import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock3, Search, User, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import { activityService } from '@/services/activityService';
import { dashboardService } from '@/services/dashboardService';
import { depositsService } from '@/services/depositsService';
import { useToast } from '@/hooks/use-toast';

interface ActivityLog {
  id: string;
  type?: string;
  message?: string;
  amount?: number | string;
  userId?: string;
  userName?: string;
  depositId?: string;
  paymentMethod?: string;
  performedBy?: string;
  timestamp?: string;
}

const getActivityPresentation = (type = '') => {
  if (type.includes('approved')) return { icon: CheckCircle2, tone: 'text-success bg-success/10' };
  if (type.includes('rejected')) return { icon: XCircle, tone: 'text-destructive bg-destructive/10' };
  if (type.includes('pending')) return { icon: Clock3, tone: 'text-warning bg-warning/10' };
  if (type.includes('user')) return { icon: User, tone: 'text-info bg-info/10' };
  return { icon: Activity, tone: 'text-primary bg-primary/10' };
};

const formatDate = (value?: string) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await activityService.getAllActivityLogs(100);
        const enrichedLogs = await Promise.all(result.map(async (log) => {
          const [user, deposit] = await Promise.all([
            log.userId ? dashboardService.getUserById(log.userId).catch(() => null) : Promise.resolve(null),
            log.depositId ? depositsService.getDepositById(log.depositId).catch(() => null) : Promise.resolve(null),
          ]);
          return {
            ...log,
            userName: log.userName || user?.fullName || user?.fullname || user?.username,
            paymentMethod: log.paymentMethod || deposit?.paymentMethod,
          };
        }));
        if (active) setLogs(enrichedLogs);
      } catch (fetchError) {
        console.error('Error loading activity logs:', fetchError);
        if (active) {
          setError('Activity logs could not be loaded.');
          toast({ title: 'Unable to load activity logs', description: 'Check your Firebase permissions and try again.', variant: 'destructive' });
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchLogs();
    return () => { active = false; };
  }, [toast]);

  const filteredLogs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) => [log.message, log.type, log.userId, log.userName, log.paymentMethod, log.performedBy].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [logs, searchValue]);

  return (
    <DashboardLayout title="Activity Logs" searchValue={searchValue} onSearchChange={setSearchValue}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Activity logs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review administrative actions and account activity.</p>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
        <Search className="h-4 w-4 shrink-0" />
        <Input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search activity, user, or action..." className="h-9 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" aria-label="Search activity logs" />
      </div>

      {loading ? <LoadingState title="Loading activity" description="Fetching recent administrative events..." /> : error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">{error}</div> : filteredLogs.length === 0 ? <EmptyState icon={Activity} title="No activity found" description={searchValue ? 'Try a different search term.' : 'Administrative events will appear here.'} /> : <div className="space-y-3">{filteredLogs.map((log) => { const presentation = getActivityPresentation(log.type); const Icon = presentation.icon; return <article key={log.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm-custom"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${presentation.tone}`}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><p className="font-medium text-foreground">{log.message || log.type || 'Activity event'}</p>{log.amount !== undefined && <strong className="text-sm text-primary">${Number(log.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>}</div><div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4"><span>{formatDate(log.timestamp)}</span>{log.userName && <span><strong className="font-medium text-foreground">User:</strong> {log.userName}</span>}{log.paymentMethod && <span><strong className="font-medium text-foreground">Payment:</strong> {log.paymentMethod}</span>}{log.performedBy && <span><strong className="font-medium text-foreground">By:</strong> {log.performedBy}</span>}</div></div></article>; })}</div>}
    </DashboardLayout>
  );
};

export default ActivityLogsPage;
