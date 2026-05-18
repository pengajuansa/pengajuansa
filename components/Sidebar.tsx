"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../supabase/lib/supabase';
import {
  UniversityIcon,
  HomeIcon,
  RegistrationIcon,
  HistoryIcon,
  TaskIcon
} from './icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    localStorage.removeItem('user');
    router.push('/login');
  };

  const menuItems = [
    { path: '/mahasiswa/beranda', label: 'Beranda', icon: <HomeIcon /> },
    { path: '/mahasiswa/pendaftaran', label: 'Pendaftaran', icon: <RegistrationIcon /> },
    { path: '/mahasiswa/mata-kuliah', label: 'Mata Kuliah SA', icon: <UniversityIcon /> },
    { path: '/mahasiswa/tugas', label: 'Tugas Kuliah', icon: <TaskIcon /> },
    { path: '/mahasiswa/riwayat', label: 'Riwayat Akademik', icon: <HistoryIcon /> },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-gray-100 bg-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex items-center gap-3 p-6 lg:p-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/48/Logo_Politeknik_Negeri_Manado.png"
              alt="Logo Polimdo"
              className="h-full w-full object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <h1 className="m-0 text-xl font-bold text-[#1A365D]">Polimdo</h1>
            <p className="m-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              MANAGEMENT PORTAL
            </p>
          </div>
        </div>

        <ul className="mt-4 flex-grow list-none px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path} className="mb-2">
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`group relative flex items-center gap-4 rounded-lg px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-white text-[#1A365D] shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#1A365D]'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#1A365D]"></div>
                  )}
                  <span className={`transition-colors duration-200 ${isActive ? 'text-[#1A365D]' : 'text-gray-400 group-hover:text-[#1A365D]'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* User Profile Footer */}
        <div className="mt-auto px-4 pb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-gray-100/80 p-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-teal-600">
                <img src={`https://ui-avatars.com/api/?name=${user?.nama_lengkap || 'User'}&background=random`} alt="User Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-gray-900">{user?.nama_lengkap || 'Loading...'}</span>
                <span className="text-[10px] font-medium text-gray-500">{user?.nim_nip || '000000'}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 py-2 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
