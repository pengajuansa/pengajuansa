"use client";

import React from 'react';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const TeacherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5V4.5z"></path></svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

import { useEffect, useState } from 'react';
import { supabase } from '../../../supabase/lib/supabase';

export default function AdministratorDashboard() {
  const [counts, setCounts] = useState({
    mahasiswa: 0,
    dosen: 0,
    mataKuliah: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    
    // 1. Hitung Mahasiswa
    const { count: mCount } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true });

    // 2. Hitung Dosen
    const { count: dCount } = await supabase
      .from('dosen')
      .select('*', { count: 'exact', head: true });

    // 3. Hitung Mata Kuliah
    const { count: mkCount } = await supabase
      .from('mata_kuliah')
      .select('*', { count: 'exact', head: true });

    setCounts({
      mahasiswa: mCount || 0,
      dosen: dCount || 0,
      mataKuliah: mkCount || 0
    });
    setLoading(false);
  };

  const topbarTitle = (
    <div>
      <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Dashboard Administrator System</h2>
      <p className="text-xs font-semibold text-gray-500">Pusat Kendali Data Master & Konfigurasi Akademik</p>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-10">

        {/* Large Header Section */}
        <div className="relative overflow-hidden rounded-2xl lg:rounded-[2.5rem] bg-[#0F172A] p-6 md:p-12 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-4xl font-black mb-3 md:mb-4">Selamat Datang di Core System</h3>
              <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-medium">
                Anda memiliki akses penuh untuk mengelola data master mahasiswa, dosen, dan mata kuliah di seluruh sistem pendaftaran Semester Antara.
              </p>
            </div>
            <div className="hidden lg:block opacity-20">
              <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-600/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl"></div>
        </div>

        {/* Stats Row - Full Width with larger gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
          <div className="group rounded-2xl lg:rounded-[2.5rem] bg-white p-6 md:p-10 shadow-sm border border-gray-50 flex items-center gap-4 md:gap-8 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
            <div className="flex h-14 w-14 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl md:rounded-3xl bg-red-50 text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
              <UserIcon />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Mahasiswa</p>
              <span className="text-3xl md:text-4xl font-black text-[#1A365D]">{loading ? '...' : counts.mahasiswa.toLocaleString('id-ID')}</span>
              <p className="text-[10px] text-green-600 font-bold mt-1 uppercase tracking-widest">Data Terverifikasi</p>
            </div>
          </div>

          <div className="group rounded-2xl lg:rounded-[2.5rem] bg-white p-6 md:p-10 shadow-sm border border-gray-50 flex items-center gap-4 md:gap-8 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
            <div className="flex h-14 w-14 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl md:rounded-3xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <TeacherIcon />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Dosen</p>
              <span className="text-3xl md:text-4xl font-black text-[#1A365D]">{loading ? '...' : counts.dosen.toLocaleString('id-ID')}</span>
              <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-widest">Semua Departemen</p>
            </div>
          </div>

          <div className="group rounded-2xl lg:rounded-[2.5rem] bg-white p-6 md:p-10 shadow-sm border border-gray-50 flex items-center gap-4 md:gap-8 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10"></div>}
            <div className="flex h-14 w-14 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl md:rounded-3xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
              <BookIcon />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Mata Kuliah</p>
              <span className="text-3xl md:text-4xl font-black text-[#1A365D]">{loading ? '...' : counts.mataKuliah.toLocaleString('id-ID')}</span>
              <p className="text-[10px] text-orange-600 font-bold mt-1 uppercase tracking-widest">Katalog Master</p>
            </div>
          </div>
        </div>

        {/* Quick Access - Full Width */}
        <div className="rounded-2xl lg:rounded-[2.5rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div>
              <h3 className="text-lg md:text-2xl font-black text-[#1A365D] uppercase tracking-wider">Akses Cepat Data Master</h3>
              <p className="text-sm font-semibold text-gray-400 mt-1">Kelola informasi utama sistem dalam satu klik</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Link href="/admin/mahasiswa" className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-gray-50 p-8 transition-all hover:bg-red-600">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm transition-transform group-hover:scale-110">
                <UserIcon />
              </div>
              <h4 className="text-lg font-black text-gray-900 group-hover:text-white transition-colors">Manajemen Mahasiswa</h4>
              <p className="text-xs text-gray-500 group-hover:text-red-100 transition-colors mt-2 leading-relaxed">
                Otoritas penuh untuk mengubah profil, status, dan data akademik mahasiswa.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-red-600 group-hover:text-white transition-colors uppercase tracking-widest">
                Buka Modul <ChevronRightIcon />
              </div>
            </Link>

            <Link href="/admin/dosen" className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-gray-50 p-8 transition-all hover:bg-blue-600">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                <TeacherIcon />
              </div>
              <h4 className="text-lg font-black text-gray-900 group-hover:text-white transition-colors">Manajemen Dosen</h4>
              <p className="text-xs text-gray-500 group-hover:text-blue-100 transition-colors mt-2 leading-relaxed">
                Atur NIDN, jabatan fungsional, dan penugasan dosen pengajar.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-blue-600 group-hover:text-white transition-colors uppercase tracking-widest">
                Buka Modul <ChevronRightIcon />
              </div>
            </Link>

            <Link href="/admin/mata-kuliah" className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-gray-50 p-8 transition-all hover:bg-orange-600">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm transition-transform group-hover:scale-110">
                <BookIcon />
              </div>
              <h4 className="text-lg font-black text-gray-900 group-hover:text-white transition-colors">Data Mata Kuliah</h4>
              <p className="text-xs text-gray-500 group-hover:text-orange-100 transition-colors mt-2 leading-relaxed">
                Kelola master katalog mata kuliah dan distribusi SKS kurikulum.
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-orange-600 group-hover:text-white transition-colors uppercase tracking-widest">
                Buka Modul <ChevronRightIcon />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
