import { NavLink } from '@/components/NavLink';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase.js';
import { depositsService } from '@/services/depositsService';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard' },
  { icon: Settings, label: 'Account Settings', path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending deposits count
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
    } catch {
      // ignore signOut errors
    } finally {
      localStorage.removeItem('admin');
      navigate('/');
    }
  };

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border min-h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm-custom">
            <Wallet className="h-5 w-5" />
          </div>
          <div><h1 className="text-base font-bold text-foreground">Pennywise</h1><p className="text-[10px] text-muted-foreground">Admin Panel</p></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin-dashboard'}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
              activeClassName="bg-sidebar-accent text-primary shadow-sm-custom"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {admin.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Admin</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {admin.email || 'admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
