import React from 'react';

interface TopbarProps {
  title?: React.ReactNode;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function Topbar({ title, onMenuToggle, isMobileMenuOpen }: TopbarProps) {
  return (
    <header className="flex w-full items-center justify-between border-b border-gray-100 bg-white px-4 py-4 md:px-8 md:py-5">
      {/* Hamburger button for mobile/tablet */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <div className="flex items-center">
          {title || (
            <>
              <h2 className="m-0 text-base md:text-xl font-bold text-[#1A365D]">Semester Antara 2024</h2>
              <div className="mx-3 md:mx-4 h-5 w-px bg-gray-300 hidden sm:block"></div>
              <span className="hidden sm:inline rounded-full bg-yellow-100 px-3 py-1 text-[10px] font-bold tracking-wide text-yellow-800">
                PENDAFTARAN DIBUKA
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
