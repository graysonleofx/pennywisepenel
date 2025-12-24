import { User } from '@/types/user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';

interface UserEditModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function UserEditModal({ user, open, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  if (!formData) return null;

  const handleChange = (field: keyof User, value: string | number | boolean) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-muted-foreground">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance" className="text-muted-foreground">Balance</Label>
              <Input
                id="balance"
                type="number"
                value={formData.balance}
                onChange={(e) => handleChange('balance', parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalProfit" className="text-muted-foreground">Total Profit</Label>
              <Input
                id="totalProfit"
                type="number"
                value={formData.totalProfit}
                onChange={(e) => handleChange('totalProfit', parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalDeposit" className="text-muted-foreground">Total Deposit</Label>
              <Input
                id="totalDeposit"
                type="number"
                value={formData.totalDeposit}
                onChange={(e) => handleChange('totalDeposit', parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalWithdrawal" className="text-muted-foreground">Total Withdrawal</Label>
              <Input
                id="totalWithdrawal"
                type="number"
                value={formData.totalWithdrawal}
                onChange={(e) => handleChange('totalWithdrawal', parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalInvestment" className="text-muted-foreground">Total Investment</Label>
              <Input
                id="totalInvestment"
                type="number"
                value={formData.totalInvestment}
                onChange={(e) => handleChange('totalInvestment', parseFloat(e.target.value) || 0)}
                className="bg-secondary border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referer" className="text-muted-foreground">Referer</Label>
              <Input
                id="referer"
                value={formData.referer}
                onChange={(e) => handleChange('referer', e.target.value)}
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <Label htmlFor="firstLogin" className="text-muted-foreground">First Login Status</Label>
            <Switch
              id="firstLogin"
              checked={formData.firstLogin}
              onCheckedChange={(checked) => handleChange('firstLogin', checked)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground hover:bg-secondary">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
