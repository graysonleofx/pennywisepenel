import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  hideSearch?: boolean;
}

export const DashboardLayout = ({
  children,
  title,
  searchValue = '',
  onSearchChange = () => {},
  hideSearch = false,
}: DashboardLayoutProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block w-64 fixed left-0 top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          title={title}
          isMobileSearchOpen={isMobileSearchOpen}
          onMobileSearchToggle={() => setIsMobileSearchOpen((p) => !p)}
          hideSearch={hideSearch}
        />

        {isMobileSearchOpen && !hideSearch && (
          <div className="block lg:hidden border-b border-border px-4 py-2 bg-card">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
