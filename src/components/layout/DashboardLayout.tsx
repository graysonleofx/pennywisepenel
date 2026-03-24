import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { Search } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export const DashboardLayout = ({
  children,
  title,
  searchValue = '',
  onSearchChange = () => {},
}: DashboardLayoutProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          title={title}
          isMobileSearchOpen={isMobileSearchOpen}
          onMobileSearchToggle={() => setIsMobileSearchOpen((p) => !p)}
        />

        {isMobileSearchOpen && (
          <div className="block md:hidden border-b px-4 py-2 bg-surface">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring focus:border-primary"
              />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
