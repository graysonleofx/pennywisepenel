import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DashboardLayout({ 
  children, 
  title,
  searchValue = '',
  onSearchChange = () => {}
}: DashboardLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        />
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
