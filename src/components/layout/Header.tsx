import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  title: string;
}

export function Header({ onMenuClick, searchValue, onSearchChange, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h2 className="text-lg md:text-xl font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-48 md:w-64 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse-glow" />
          </Button>
        </div>
      </div>
    </header>
  );
}
