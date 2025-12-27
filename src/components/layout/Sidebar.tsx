import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, ArrowLeftRight, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase.js';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin-dashboard' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();

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

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border min-h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-gradient">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
            activeClassName="bg-primary/10 text-primary glow-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="font-semibold text-foreground truncate">{JSON.parse(localStorage.getItem('admin') || '{}').email || 'admin'}</p>
        </div>

        <button onClick={handleLogout} className="mt-3 w-full text-left text-sm text-red-600 flex items-center gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
