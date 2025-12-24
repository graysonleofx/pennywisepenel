import { User } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export function UserDetailModal({ user, open, onClose }: UserDetailModalProps) {
  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(Math.min(password.length, 12));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">User Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              <AvatarImage src={user.image} alt={user.fullName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
                {user.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold text-foreground">{user.fullName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.firstLogin ? "secondary" : "default"}>
                  {user.firstLogin ? 'New User' : 'Active User'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{user.phone}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="font-medium text-foreground">{user.country}</p>
              </div>
            </div>
          </div>

          {/* Financial Info */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Financial Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="font-bold text-primary text-lg">{formatCurrency(user.balance)}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Profit</p>
                <p className="font-bold text-success text-lg">{formatCurrency(user.totalProfit)}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Deposit</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalDeposit)}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Total Withdrawal</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalWithdrawal)}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Total Investment</p>
                <p className="font-semibold text-foreground">{formatCurrency(user.totalInvestment)}</p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Account Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Referer</p>
                <p className="font-medium text-foreground">{user.referer || 'None'}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Password</p>
                <p className="font-medium text-foreground font-mono">{maskPassword(user.password)}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 col-span-2">
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="font-medium text-foreground">{user.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
