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
          <p className="eyebrow">52-week course</p>
          <h1>Basic English</h1>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d={({ today: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z', course: 'M4 4h6l2 2 2-2h6v16h-6l-2 2-2-2H4Zm8 2v16', review: 'M4 8a8 8 0 1 1-1 7M4 3v5h5M12 8v5l3 2', words: 'M4 4h16v16H4ZM8 8h8M8 12h8M8 16h5', me: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2' })[tab.id]} />
            </svg>
            <span>{tab.label}</span>
            {tab.id === 'review' && reviewCount ? <span className="nav-badge">{reviewCount}</span> : null}
          </button>
        ))}
      </nav>
    </div>
  );
}
