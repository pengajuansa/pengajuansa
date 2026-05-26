"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabase/lib/supabase';

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

interface AkademikSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AkademikSidebar({ isOpen, onClose }: AkademikSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { path: '/akademik/dashboard', label: 'Dashboard', icon: <DashboardIcon /> }
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-100 bg-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-3 p-6 lg:p-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/48/Logo_Politeknik_Negeri_Manado.png" alt="Logo Polimdo" className="h-full w-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <h1 className="m-0 text-lg font-bold text-[#1A365D]">Polimdo</h1>
            <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-gray-400">BAGIAN AKADEMIK</p>
          </div>
        </div>

        <nav className="mt-4 flex-grow px-4">
          <ul className="list-none space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link href={item.path} onClick={() => onClose?.()} className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all ${isActive ? 'bg-blue-50 text-[#1A365D]' : 'text-gray-500 hover:bg-gray-50 hover:text-[#1A365D]'}`}>
                    <span className={`${isActive ? 'text-[#1A365D]' : 'text-gray-400'}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-6 pb-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-6">
            <button onClick={handleLogout} className="flex w-full items-center gap-3 px-2 py-2 text-sm font-semibold text-gray-500 hover:text-red-600 cursor-pointer bg-transparent border-0 text-left font-sans">
              <LogoutIcon /> Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
