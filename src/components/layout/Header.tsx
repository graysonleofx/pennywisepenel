import { Search, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onMenuClick: () => void;
  isMobileSearchOpen?: boolean;
  onMobileSearchToggle?: () => void;
}

export const Header = ({
  title,
  searchValue = '',
  onSearchChange = () => {},
  onMenuClick,
  isMobileSearchOpen = false,
  onMobileSearchToggle = () => {},
}: HeaderProps) => (
  <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
    <div className="flex items-center justify-between gap-2 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <button onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2 rounded-lg border"
            placeholder="Search..."
          />
        </div>
      </div>

      <button
        onClick={onMobileSearchToggle}
        className="md:hidden"
        aria-label={isMobileSearchOpen ? 'Close search' : 'Open search'}
      >
        <Search className="h-4 w-4" />
      </button>
    </div>
  </header>
);
