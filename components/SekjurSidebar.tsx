"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabase/lib/supabase';

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const PaymentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const FormIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

interface SekjurSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SekjurSidebar({ isOpen, onClose }: SekjurSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.error(e); }
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { path: '/sekjur/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/sekjur/pembayaran', label: 'Verifikasi Pembayaran', icon: <PaymentIcon /> },
    { path: '/sekjur/formulir-sa', label: 'Formulir SA', icon: <FormIcon /> },
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
            <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-gray-400">MANAJEMEN AKADEMIK</p>
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
          <Link href="/sekjur/laporan" onClick={() => onClose?.()} className="flex justify-center w-full rounded-xl bg-[#114093] py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-transform hover:scale-[1.02] active:scale-95">
            Laporan Semester
          </Link>
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
