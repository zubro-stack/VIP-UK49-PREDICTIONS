import { useState } from 'react';
import { EnginePage } from './EnginePage';

/**
 * Wraps EnginePage with an internal tab switcher for pages that bundle
 * several pairwise algorithms under one heading (V1: Sequential/Family,
 * Bonus Tracker: Sequential/Family/V2) - mirroring the legacy app, where
 * these were one page with tabs rather than separate routes.
 */
export function EngineGroupPage({ label, tabs }) {
  const [activeCode, setActiveCode] = useState(tabs[0].code);
  const activeTab = tabs.find((t) => t.code === activeCode);

  return (
    <div>
      {tabs.length > 1 && (
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.code}
              onClick={() => setActiveCode(tab.code)}
              className={`tab-btn${activeCode === tab.code ? ' active' : ''}`}
            >
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
      )}
      <EnginePage code={activeTab.code} label={tabs.length > 1 ? `${label} — ${activeTab.label}` : label} />
    </div>
  );
}
