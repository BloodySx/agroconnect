import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    if (!navigationOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavigationOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigationOpen]);

  return (
    <div className="app-shell">
      <Sidebar open={navigationOpen} onNavigate={() => setNavigationOpen(false)} />
      {navigationOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setNavigationOpen(false)}
        />
      )}
      <div className="main">
        <Header
          title={title}
          subtitle={subtitle}
          navigationOpen={navigationOpen}
          onToggleNavigation={() => setNavigationOpen((open) => !open)}
        />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
