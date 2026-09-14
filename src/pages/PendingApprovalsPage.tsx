import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterDropdown, FilterOption } from '@/components/ui/FilterDropdown';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { depositsService } from '@/services/depositsService';
import { dashboardService } from '@/services/dashboardService';
import { Clock, Eye } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  userName?: string;
  userEmail?: string;
  userBalance?: number;
}

const PendingApprovalsPage = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    deposit: Deposit | null;
  }>({
    isOpen: false,
    type: null,
    deposit: null,
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = async () => {
    try {
      setLoading(true);
      const pendingDeposits = await depositsService.getPendingDeposits();
      
      // Enrich deposits with user data
      const enrichedDeposits = await Promise.all(
        pendingDeposits.map(async (deposit) => {
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
    } catch (error) {
      console.error('Error fetching pending deposits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending deposits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDeposit = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setShowReviewModal(true);
  };

  const handleApproveClick = (deposit: Deposit) => {
    setConfirmModal({
      isOpen: true,
      type: 'approve',
      deposit,
    });
  };

  const handleRejectClick = (deposit: Deposit) => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      deposit,
    });
    setRejectionReason('');
  };

  const handleConfirmApprove = async () => {
    if (!confirmModal.deposit) return;
    
    try {
      setIsProcessing(true);
      const result = await depositsService.approveDeposit(
        confirmModal.deposit.id,
        confirmModal.deposit.userId,
        confirmModal.deposit.amount
      );

      if (result === false) {
        setConfirmModal({ isOpen: false, type: null, deposit: null });
        setShowReviewModal(false);
        setSelectedDeposit(null);
        await fetchPendingDeposits();
        toast({
          title: 'Deposit already processed',
          description: 'This deposit is no longer pending.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '✓ Deposit approved',
        description: `$${confirmModal.deposit.amount} has been added to the user's balance.`,
      });

      setConfirmModal({ isOpen: false, type: null, deposit: null });
      setShowReviewModal(false);
      setSelectedDeposit(null);
      await fetchPendingDeposits();
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve deposit',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!confirmModal.deposit) return;

    try {
      setIsProcessing(true);
      const result = await depositsService.rejectDeposit(
        confirmModal.deposit.id,
        confirmModal.deposit.userId,
        rejectionReason
      );

      if (result === false) {
        setConfirmModal({ isOpen: false, type: null, deposit: null });
        setShowReviewModal(false);
        setSelectedDeposit(null);
        setRejectionReason('');
        await fetchPendingDeposits();
        toast({
          title: 'Deposit already processed',
          description: 'This deposit is no longer pending.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '✓ Deposit rejected',
        description: 'The deposit request has been rejected.',
      });

      setConfirmModal({ isOpen: false, type: null, deposit: null });
      setShowReviewModal(false);
      setSelectedDeposit(null);
      setRejectionReason('');
      await fetchPendingDeposits();
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject deposit',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredDeposits = deposits.filter(deposit =>
    deposit.userName?.toLowerCase().includes(searchValue.toLowerCase()) ||
    deposit.userEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
    deposit.reference?.toLowerCase().includes(searchValue.toLowerCase()) ||
    String(deposit.amount).includes(searchValue)
  );

  if (loading) {
    return (
      <DashboardLayout title="Pending Approvals" hideSearch>
        <LoadingState title="Loading Deposits" description="Fetching pending deposits..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pending Approvals" searchValue={searchValue} onSearchChange={setSearchValue} hideSearch>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Pending Deposit Requests</h1>
        <p className="text-muted-foreground">
          Review and manage deposits waiting for approval.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search by user, email, or reference..."
          className="flex-1"
        />
      </div>

      {/* Results */}
      <div className="premium-card">
        {filteredDeposits.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Pending Deposits"
            description={
              searchValue 
                ? 'No deposits match your search criteria' 
                : 'All pending deposits have been processed'
            }
          />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredDeposits.map((deposit) => (
                <article key={deposit.id} className="rounded-xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{deposit.userName || 'Unknown User'}</p>
                      <p className="truncate text-xs text-muted-foreground">{deposit.userEmail}</p>
                    </div>
                    <StatusBadge status={deposit.status} size="sm" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-muted-foreground">Deposit</p><p className="font-semibold text-success">${deposit.amount}</p></div>
                    <div><p className="text-xs text-muted-foreground">Method</p><p className="truncate text-foreground">{deposit.paymentMethod}</p></div>
                    <div><p className="text-xs text-muted-foreground">Reference</p><p className="truncate font-mono text-foreground">{deposit.reference}</p></div>
                    <div><p className="text-xs text-muted-foreground">Submitted</p><p className="text-foreground">{new Date(deposit.submittedDate).toLocaleDateString()}</p></div>
                  </div>
                  <Button onClick={() => handleReviewDeposit(deposit)} className="mt-4 min-h-11 w-full gap-2"><Eye className="h-4 w-4" />Review deposit</Button>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Amount</TableHead>
                  <TableHead className="text-foreground">Method</TableHead>
                  <TableHead className="text-foreground">Reference</TableHead>
                  <TableHead className="text-foreground">Submitted</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-right text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.map((deposit) => (
                  <TableRow key={deposit.id} className="border-border hover:bg-background/50 transition-colors">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-foreground">{deposit.userName || 'Unknown User'}</p>
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
                        onClick={() => handleReviewDeposit(deposit)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Review Deposit Request</DialogTitle>
            <DialogDescription>
              Approve or reject this deposit request
            </DialogDescription>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">User Information</h4>
                <div className="bg-background/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Name</span>
                    <span className="font-medium text-foreground">{selectedDeposit.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Email</span>
                    <span className="font-medium text-foreground text-sm">{selectedDeposit.userEmail}</span>
                  </div>
                </div>
              </div>

              {/* Deposit Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Deposit Information</h4>
                <div className="bg-background/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Amount</span>
                    <span className="font-bold text-success text-lg">${selectedDeposit.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Method</span>
                    <span className="font-medium text-foreground">{selectedDeposit.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Reference</span>
                    <span className="font-mono text-foreground text-sm">{selectedDeposit.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Submitted</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedDeposit.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-sm">Financial Preview</h4>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Current Balance</span>
                    <span className="font-medium text-foreground">${selectedDeposit.userBalance || 0}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span className="text-sm">+ Deposit Amount</span>
                    <span className="font-bold">${selectedDeposit.amount}</span>
                  </div>
                  <div className="border-t border-primary/30 pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">New Balance</span>
                    <span className="font-bold text-primary">
                      ${((selectedDeposit.userBalance || 0) + selectedDeposit.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleRejectClick(selectedDeposit)}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveClick(selectedDeposit)}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modals */}
      {confirmModal.type === 'approve' && confirmModal.deposit && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          type="info"
          title="Confirm Deposit Approval"
          description="You are about to approve this deposit."
          message={
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User:</span>
                <span className="font-medium text-foreground">{confirmModal.deposit.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-success">${confirmModal.deposit.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Balance:</span>
                <span className="font-medium">${confirmModal.deposit.userBalance || 0}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold">New Balance After Approval:</span>
                <span className="font-bold text-primary">
                  ${((confirmModal.deposit.userBalance || 0) + confirmModal.deposit.amount).toFixed(2)}
                </span>
              </div>
            </div>
          }
          confirmLabel="Confirm Approval"
          cancelLabel="Cancel"
          isLoading={isProcessing}
          onConfirm={handleConfirmApprove}
          onCancel={() => setConfirmModal({ isOpen: false, type: null, deposit: null })}
        />
      )}

      {confirmModal.type === 'reject' && confirmModal.deposit && (
        <Dialog
          open={confirmModal.isOpen}
          onOpenChange={() => setConfirmModal({ isOpen: false, type: null, deposit: null })}
        >
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Reject Deposit</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this deposit?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm">
                <p className="text-foreground font-medium mb-1">{confirmModal.deposit.userName}</p>
                <p className="text-destructive font-bold text-lg">${confirmModal.deposit.amount}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rejection Reason (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Invalid payment confirmation, Incorrect transaction reference..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmModal({ isOpen: false, type: null, deposit: null })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmReject}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default PendingApprovalsPage;
