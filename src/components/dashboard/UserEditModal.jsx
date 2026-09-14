import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';

export function UserEditModal({ user, open, onClose, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  if (!formData) return null;

  const handleChange = (field, value) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const numericFields = [
    ['accountBalance', 'Available Balance'],
    // ['totalDeposit', 'Total Deposit'],
    // ['totalWithdrawal', 'Total Withdrawal'],
    ['totalInvestment', 'Total Investment'],
    ['totalProfit', 'Total Profit'],
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="user-detail-drawer h-screen max-h-screen w-full max-w-md overflow-hidden rounded-none border-border bg-card p-0 sm:max-w-md md:max-w-[390px]">
        <DialogHeader className="shrink-0 px-5 pt-5 sm:px-7 sm:pt-7">
          <DialogTitle className="text-foreground">Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex max-h-[calc(100vh-8rem)] min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Personal information</h3>
                  <p className="text-xs text-muted-foreground">Basic identity and login details.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-muted-foreground">Full Name</Label>
                    <Input id="fullName" value={formData.fullName || ''} onChange={(e) => handleChange('fullName', e.target.value)} className="bg-secondary border-border text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                    <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} className="bg-secondary border-border text-foreground" />
                  </div>
                </div>
              </section>

              <Separator />
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Contact information</h3>
                  <p className="text-xs text-muted-foreground">Keep contact details current.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {['phone', 'country'].map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="text-muted-foreground">{field === 'phone' ? 'Phone' : 'Country'}</Label>
                      <Input id={field} value={formData[field] || ''} onChange={(e) => handleChange(field, e.target.value)} className="bg-secondary border-border text-foreground" />
                    </div>
                  ))}
                </div>
              </section>

              <Separator />
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Financial information</h3>
                  <p className="text-xs text-muted-foreground">Administrative values only. Passwords are never displayed.</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {numericFields.map(([field, label]) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="text-muted-foreground">{label}</Label>
                      <Input id={field} type="number" value={formData[field] ?? 0} onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)} className="bg-secondary border-border text-foreground" />
                    </div>
                  ))}
                </div>
              </section>

              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <Label htmlFor="firstLogin" className="text-muted-foreground">First Login Status</Label>
                <Switch id="firstLogin" checked={Boolean(formData.firstLogin)} onCheckedChange={(checked) => handleChange('firstLogin', checked)} />
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 grid shrink-0 grid-cols-2 gap-2 border-t border-border bg-card px-5 py-4 sm:px-7">
            <Button type="button" variant="outline" className="min-h-11" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
