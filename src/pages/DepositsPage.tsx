import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/hooks/use-toast';
import { depositsService } from '@/services/depositsService';
import { dashboardService } from '@/services/dashboardService';
import { Wallet, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DepositManagementPage = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeposits();
  }, [filterStatus]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {};
      const allDeposits = await depositsService.getAllDeposits(filters);

      // Enrich deposits with user data
      const enrichedDeposits = await Promise.all(
        allDeposits.map(async (deposit) => {
          try {
            const user = await dashboardService.getUserById(deposit.userId);
            return {
              ...deposit,
              userName: user?.fullName,
              userEmail: user?.email,
              userBalance: user?.accountBalance || user?.balance || 0,
            };
          } catch {
            return deposit;
          }
        })
      );

      setDeposits(enrichedDeposits);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deposits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (deposit) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
  };

  const filteredDeposits = deposits.filter(deposit =>
    deposit.userName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    deposit.userEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
    deposit.reference?.toLowerCase().includes(searchValue.toLowerCase()) ||
    String(deposit.amount).includes(searchValue)
  );

  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  const getStatusCounts = () => {
    return {
      all: deposits.length,
      pending: deposits.filter(d => d.status === 'pending').length,
      approved: deposits.filter(d => d.status === 'approved').length,
      rejected: deposits.filter(d => d.status === 'rejected').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <DashboardLayout title="Deposits" hideSearch>
        <LoadingState title="Loading Deposits" description="Fetching deposit data..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Deposits" searchValue={searchValue} onSearchChange={setSearchValue} hideSearch>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Deposits</h1>
        <p className="text-muted-foreground">
          Manage and monitor all user deposit requests.
        </p>
      </div>

      {/* Tabs with Counts */}
      <div className="premium-card mb-6">
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="grid w-full grid-cols-4 bg-background/50">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Deposits
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {counts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              Pending
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                {counts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              Approved
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-success/10 text-success text-xs font-semibold">
                {counts.approved}
              </span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              Rejected
              <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                {counts.rejected}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="mt-6">
            <div className="mb-4">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search by user, email, or reference..."
              />
            </div>

            {paginatedDeposits.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No Deposits Found"
                description={
                  searchValue
                    ? 'No deposits match your search criteria'
                    : `No ${filterStatus !== 'all' ? filterStatus : ''} deposits to display`
                }
              />
            ) : (
              <>
                <div className="space-y-3 mb-4 md:hidden">
                  {paginatedDeposits.map((deposit) => (
                    <article key={deposit.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0"><p className="truncate font-semibold text-foreground">{deposit.userName || 'Unknown'}</p><p className="truncate text-xs text-muted-foreground">{deposit.paymentMethod} · {deposit.reference}</p></div>
                        <StatusBadge status={deposit.status} size="sm" />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">Amount</p><p className="text-lg font-bold text-success">${deposit.amount}</p></div><p className="text-xs text-muted-foreground">{new Date(deposit.submittedDate).toLocaleDateString()}</p></div>
                      <Button variant="outline" onClick={() => handleViewDetails(deposit)} className="mt-4 min-h-11 w-full gap-2"><Eye className="h-4 w-4" />View details</Button>
                    </article>
                  ))}
                </div>
                <div className="hidden overflow-x-auto mb-4 md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-foreground">User</TableHead>
                        <TableHead className="text-foreground">Amount</TableHead>
                        <TableHead className="text-foreground">Method</TableHead>
                        <TableHead className="text-foreground">Reference</TableHead>
                        <TableHead className="text-foreground">Date</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-right text-foreground">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedDeposits.map((deposit) => (
                        <TableRow key={deposit.id} className="border-border hover:bg-background/50 transition-colors">
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-foreground">{deposit.userName || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{deposit.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-success">
                            ${deposit.amount}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {deposit.paymentMethod}
                          </TableCell>
                          <TableCell className="text-foreground text-sm font-mono">
                            {deposit.reference}
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {new Date(deposit.submittedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={deposit.status} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(deposit)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Tabs>
      </div>

      {/* Detail Modal */}
      {selectedDeposit && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Deposit Details</DialogTitle>
              <DialogDescription>
                Full information about this deposit
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium text-foreground">{selectedDeposit.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground break-all">{selectedDeposit.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-medium text-foreground">${selectedDeposit.userBalance || 0}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Deposit Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-bold text-success text-base">${selectedDeposit.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-medium text-foreground">{selectedDeposit.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-foreground">{selectedDeposit.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedDeposit.submittedDate).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Status</h4>
                <StatusBadge status={selectedDeposit.status} />
              </div>

              {/* Rejection Reason (if applicable) */}
              {selectedDeposit.status === 'rejected' && selectedDeposit.rejectionReason && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Rejection Reason</h4>
                  <p className="text-sm text-destructive">{selectedDeposit.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {selectedDeposit.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetailModal(false);
                        window.location.href = '/pending-approvals';
                      }}
                      className="flex-1"
                    >
                      Go to Approvals
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default DepositManagementPage;
