import { Search, Menu, Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase.js';
import { useState, useEffect } from 'react';
import { depositsService } from '@/services/depositsService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onMenuClick: () => void;
  isMobileSearchOpen?: boolean;
  onMobileSearchToggle?: () => void;
  hideSearch?: boolean;
}

export const Header = ({
  title,
  searchValue = '',
  onSearchChange = () => {},
  onMenuClick,
  isMobileSearchOpen = false,
  onMobileSearchToggle = () => {},
  hideSearch = false,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const count = await depositsService.getPendingCount();
        setPendingCount(count);
      } catch (error) {
        console.error('Error fetching pending count:', error);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('admin');
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center justify-between gap-4 p-4 md:p-6">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
        </div>

        {/* Center Section - Search (Desktop) */}
        {!hideSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Toggle Mobile */}
          {!hideSearch && (
            <button
              onClick={onMobileSearchToggle}
              className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => navigate('/pending-approvals')}
            className="relative p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Pending notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-warning text-warning-foreground text-xs font-bold flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </button>

          {/* Admin Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {admin.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="hidden md:inline text-sm font-medium text-foreground max-w-[100px] truncate">
                  {admin.email?.split('@')[0] || 'Admin'}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground">Admin Account</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {admin.email || 'admin@example.com'}
                </p>
              </div>

              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
