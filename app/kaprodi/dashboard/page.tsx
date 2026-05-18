"use client";

import React, { useState, useEffect } from 'react';
import KaprodiLayout from '../../../components/KaprodiLayout';
import Link from 'next/link';
import { supabase } from '../../../supabase/lib/supabase';

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);

const FileCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="m9 15 2 2 4-4"></path></svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
);

export default function KaprodiDashboard() {
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({show: false, msg: ""});
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [forms, setForms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendingKaprodi: 0,
    totalMahasiswa: 0,
    alokasiMK: 0,
    totalMK: 0,
    persenAlokasi: 0
  });

  const showNotify = (msg: string) => {
    setNotification({show: true, msg});
    setTimeout(() => setNotification({show: false, msg: ""}), 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    // 1. Fetch Formulir Menunggu Validasi Kaprodi (Status: Approved oleh Sekjur)
    const { data: pendaftaranData } = await supabase
      .from('pendaftaran_sa')
      .select(`
        *,
        mahasiswa:mahasiswa_id (nama_mahasiswa, nim, prodi),
        items:pendaftaran_items (
          mata_kuliah:mk_id (nama_mk)
        )
      `)
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });

    // 2. Fetch Total Mahasiswa (dari tabel mahasiswa langsung)
    const { count: mCount } = await supabase
      .from('mahasiswa')
      .select('*', { count: 'exact', head: true });
    const totalMahasiswa = mCount || 0;

    // 3. Fetch Alokasi Dosen Stats
    const { data: allMK } = await supabase.from('mata_kuliah').select('id');
    const { data: allAlokasi } = await supabase.from('alokasi_dosen').select('mk_id');
    
    const totalMataKuliah = allMK?.length || 0;
    const allocatedMK = new Set(allAlokasi?.map(a => a.mk_id)).size;
    const persen = totalMataKuliah > 0 ? Math.round((allocatedMK / totalMataKuliah) * 100) : 0;

    if (pendaftaranData) setForms(pendaftaranData.slice(0, 4));

    setStats({
      pendingKaprodi: pendaftaranData?.length || 0,
      totalMahasiswa: totalMahasiswa,
      alokasiMK: allocatedMK,
      totalMK: totalMataKuliah,
      persenAlokasi: persen
    });

    setLoading(false);
  };



  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const topbarTitle = (
    <div>
      <h2 className="m-0 text-xl font-extrabold text-[#0F172A]">Portal Utama Kaprodi</h2>
      <p className="text-xs font-semibold text-gray-500">Selamat datang kembali, Kaprodi Sistem Informasi</p>
    </div>
  );

  return (
    <KaprodiLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-10 relative">
        
        {/* Toast Notification */}
        {notification.show && (
          <div className="fixed top-8 right-8 z-[110] flex items-center gap-3 rounded-2xl bg-[#0F172A] px-6 py-4 text-white shadow-2xl animate-in slide-in-from-right border border-white/10">
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
            <p className="text-xs font-black uppercase tracking-widest">{notification.msg}</p>
          </div>
        )}

        {/* Key Stats for Kaprodi */}
        <div className="grid grid-cols-3 gap-8">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-50 group hover:shadow-lg transition-all relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center"><div className="h-4 w-4 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Menunggu Validasi</p>
              <div className="rounded-2xl bg-blue-50 p-3 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500"><FileCheckIcon /></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-[#0F172A]">{stats.pendingKaprodi}</span>
              <span className="rounded-xl bg-orange-50 px-3 py-1.5 text-[10px] font-black text-orange-600 border border-orange-100">PENGAJUAN BARU</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-wider italic">Segera validasi sebelum deadline</p>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm border border-gray-50 group hover:shadow-lg transition-all relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center"><div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Dosen Teralokasi</p>
              <div className="rounded-2xl bg-orange-50 p-3 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500"><UserPlusIcon /></div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-[#0F172A]">{stats.alokasiMK}/{stats.totalMK}</span>
              <div className="flex items-center gap-1.5 text-[11px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <TrendingUpIcon /> {stats.persenAlokasi}%
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-50 mt-6 overflow-hidden">
              <div className="h-full rounded-full bg-orange-500 shadow-sm transition-all duration-1000" style={{ width: `${stats.persenAlokasi}%` }}></div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 text-white shadow-2xl shadow-blue-900/10 group hover:scale-[1.02] transition-transform duration-500">
            {loading && <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-20 flex items-center justify-center"><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-4">Total Mahasiswa SA</p>
              <span className="text-6xl font-black">{stats.totalMahasiswa}</span>
              <p className="text-[10px] text-blue-400 mt-4 font-bold uppercase tracking-widest bg-white/5 w-fit px-3 py-1 rounded-lg">TA 2023/2024 - Genap</p>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all duration-700 z-0">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/><path d="M19 13.5v1.65l-7 3.82-7-3.82v-1.65l7 3.82 7-3.82z"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-10">
          {/* Main List: Recent Forms to Validate */}
          <div className="col-span-8">
            <div className="rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-50 relative">
              {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-[2.5rem]"></div>}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-wider">Validasi Formulir Terbaru</h3>
                   {forms.length > 0 && <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>}
                </div>
                <Link href="/kaprodi/validasi-formulir" className="text-[11px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl transition-all">Lihat Semua</Link>
              </div>

              <div className="space-y-5">
                {forms.length > 0 ? forms.map((form, idx) => (
                  <div key={`${form.id}-${idx}`} className="flex items-center justify-between rounded-3xl bg-gray-50/30 p-6 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all border border-transparent hover:border-blue-50 group">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[12px] font-black text-blue-800 tracking-tighter border border-white shadow-sm shrink-0">
                        {getInitials(form.mahasiswa?.nama_mahasiswa)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-1">{form.mahasiswa?.nama_mahasiswa}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-tight">NIM: {form.mahasiswa?.nim} • <span className="text-blue-600">{form.items?.[0]?.mata_kuliah?.nama_mk || 'Multi MK'}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Link 
                        href="/kaprodi/validasi-formulir"
                        className="rounded-2xl bg-[#0F172A] px-6 py-3 text-[10px] font-black text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest"
                      >
                         Buka Validasi
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 flex flex-col items-center text-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                     <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Antrean Kosong</p>
                     <p className="text-xs font-bold text-gray-300 mt-2">Tidak ada formulir yang menunggu validasi Kaprodi saat ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Urgent Tasks */}
          <div className="col-span-4">
            <div className="h-full rounded-[2.5rem] bg-orange-50/30 p-10 border border-orange-100 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full -mr-10 -mt-10"></div>
              
              <h3 className="text-[11px] font-black text-orange-800 uppercase tracking-[0.2em] mb-10 relative z-10">Tugas Mendesak</h3>
              
              <div className="space-y-8 relative z-10 flex-grow">
                <div className="relative pl-8 border-l-2 border-orange-200">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                  <h4 className="text-sm font-black text-[#0F172A]">Alokasi Dosen</h4>
                  <p className="text-[10px] font-bold text-gray-500 mt-2 leading-relaxed">
                    Terdapat <span className="text-orange-600 font-black">{stats.totalMK - stats.alokasiMK} mata kuliah</span> yang belum memiliki dosen pengajar utama dari {stats.totalMK} MK yang tersedia.
                  </p>
                </div>

                <div className="relative pl-8 border-l-2 border-gray-200">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-300 ring-4 ring-gray-50"></div>
                  <h4 className="text-sm font-black text-[#0F172A]">Validasi Kolektif</h4>
                  <p className="text-[10px] font-bold text-gray-500 mt-2 leading-relaxed">
                    Saat ini ada <span className="font-black text-gray-900">{stats.pendingKaprodi} formulir</span> menumpuk yang butuh validasi segera.
                  </p>
                </div>
              </div>

              <Link 
                href="/kaprodi/alokasi"
                className="w-full mt-12 flex items-center justify-center rounded-[1.5rem] bg-orange-500 py-5 text-[11px] font-black text-white shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest mt-auto"
              >
                Selesaikan Alokasi Dosen
              </Link>
            </div>
          </div>
        </div>

      </div>
    </KaprodiLayout>
  );
}
