import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function UserDetailModal({ user, open, onClose }) {
  if (!user) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="user-detail-drawer h-screen max-h-screen w-full max-w-md overflow-y-auto rounded-none border-border bg-card p-5 sm:p-7 md:max-w-[390px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl bg-secondary/50 p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image} alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                {user.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-semibold text-foreground">{user.fullName}</h3>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={user.firstLogin ? "secondary" : "default"} className="text-[10px]">
                  {user.firstLogin ? 'New User' : 'Active User'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl bg-secondary/50 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Phone</p><p className="mt-1 font-medium text-foreground">{user.phone || 'Not provided'}</p></div>
            <div className="rounded-xl bg-secondary/50 p-3"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Account ID</p><p className="mt-1 break-all font-medium text-foreground">#{user.id}</p></div>
          </div>

          {/* Financial Info */}
          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Financial Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-bold text-primary text-lg">{formatCurrency(user.accountBalance)}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="font-bold text-success text-lg">{formatCurrency(user.totalProfit)}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Total Deposit</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalDeposit)}</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Total Withdrawal</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalWithdrawal)}</p>
              </div>
              <div className="col-span-2 rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Total Investment</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalInvestment)}</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Account Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground">Referer</p>
                <p className="font-medium text-foreground">{user.referer || 'None'}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Password</p>
                <p className="font-medium text-foreground">{user.password}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
