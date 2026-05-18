"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Redirect berdasarkan role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'dosen':
            router.push('/dosen/dashboard');
            break;
          case 'kaprodi':
            router.push('/kaprodi/dashboard');
            break;
          case 'sekjur':
            router.push('/sekjur/dashboard');
            break;
          case 'mahasiswa':
            router.push('/mahasiswa/beranda');
            break;
          default:
            router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FB]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A365D] border-t-transparent"></div>
    </div>
  );
}
