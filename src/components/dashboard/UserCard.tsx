import { User } from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserCard({ user, onView, onEdit, onDelete }: UserCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg p-4 card-shadow border border-border/50 transition-all duration-300 hover:border-primary/30 animate-fade-in">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarImage src={user.image} alt={user.fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{user.fullName}</h3>
            <Badge variant={user.firstLogin ? "secondary" : "default"} className="text-xs">
              {user.firstLogin ? 'New' : 'Active'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <p className="text-sm text-muted-foreground">{user.country}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-secondary/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-semibold text-primary">{formatCurrency(user.balance)}</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground">Total Profit</p>
          <p className="font-semibold text-success">{formatCurrency(user.totalProfit)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onView(user)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
          onClick={() => onEdit(user)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(user)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
