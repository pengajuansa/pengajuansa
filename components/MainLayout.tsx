"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase/lib/supabase';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
  topbarTitle?: React.ReactNode;
}

export default function MainLayout({ children, topbarTitle }: MainLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!session || !user || user.role !== 'mahasiswa') {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A365D] border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans">
      <Sidebar />
      <div className="ml-[260px] flex flex-grow flex-col">
        <Topbar title={topbarTitle} />
        <div className="flex flex-grow flex-col p-8">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-12 flex items-center justify-between border-t border-gray-200 py-8 px-8 text-xs font-semibold text-gray-400">
          <p className="uppercase tracking-wider">
            © 2026 POLITEKNIK NEGERI MANADO. EXCELLENCE IN VOCATIONAL EDUCATION.
          </p>
        </footer>
      </div>
    </div>
  );
}
