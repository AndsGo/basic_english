import type { ReactNode } from 'react';

export type TabId = 'today' | 'course' | 'review' | 'words' | 'me';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'course', label: 'Course' },
  { id: 'review', label: 'Review' },
  { id: 'words', label: 'Words' },
  { id: 'me', label: 'Me' },
];

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  reviewCount?: number;
  children: ReactNode;
}

export function Layout({ activeTab, onTabChange, reviewCount, children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <p className="eyebrow">Basic English 12 Weeks</p>
          <h1>Week 1 MVP</h1>
        </div>
      </header>
      <main className="page-content">{children}</main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? 'nav-item active' : 'nav-item'}
            aria-pressed={tab.id === activeTab}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.id === 'review' && reviewCount ? <span className="nav-badge">{reviewCount}</span> : null}
          </button>
        ))}
      </nav>
    </div>
  );
}
