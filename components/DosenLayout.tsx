import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase/lib/supabase';
import DosenSidebar from './DosenSidebar';
import Topbar from './Topbar';

interface DosenLayoutProps {
  children: React.ReactNode;
  topbarTitle?: React.ReactNode;
}

export default function DosenLayout({ children, topbarTitle }: DosenLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!session || !user || user.role !== 'dosen') {
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
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-gray-900">
      <DosenSidebar />
      <div className="ml-[260px] flex flex-grow flex-col">
        <Topbar title={topbarTitle} />
        <main className="flex-grow p-8">
          {children}
        </main>

        <footer className="mt-8 flex items-center justify-between border-t border-gray-200 py-8 px-8 text-[10px] font-bold text-gray-400">
          <p className="uppercase tracking-widest">
            © 2026 POLITEKNIK NEGERI MANADO. PORTAL DOSEN.
          </p>
        </footer>
      </div>
    </div>
  );
}
