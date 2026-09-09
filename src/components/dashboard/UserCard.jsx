import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';

export function UserCard({ user, onView, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const initials = (user.fullName || 'User').split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="user-management-row group grid gap-4 border-b border-border px-4 py-4 transition hover:bg-secondary/30 md:grid-cols-[1.6fr_1fr_1fr_0.8fr_0.55fr] md:items-center md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={user.image} alt={user.fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold text-foreground">{user.fullName || 'Unnamed user'}</h3><Badge variant={user.firstLogin ? "secondary" : "default"} className="hidden text-[10px] sm:inline-flex">{user.firstLogin ? 'New' : 'Active'}</Badge></div>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="hidden text-sm text-muted-foreground md:block">{user.phone || 'Not provided'}</div>
      <div className="flex items-center justify-between md:block"><span className="text-xs text-muted-foreground md:hidden">Balance</span><p className="text-sm font-semibold text-foreground">{formatCurrency(user.accountBalance)}</p></div>
      <Button variant="outline" size="sm" className="min-h-9 w-full justify-center gap-1.5 md:w-auto" onClick={() => onView(user)}><Eye className="h-3.5 w-3.5" />View</Button>
      <div className="flex items-center justify-end gap-1 border-t border-border pt-3 md:border-0 md:pt-0">
        <Button variant="ghost" size="icon" aria-label={`Edit ${user.fullName}`} className="h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(user)}><Edit className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" aria-label={`Delete ${user.fullName}`} className="h-10 w-10 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(user)}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
