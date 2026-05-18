"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../../supabase/lib/supabase';

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

export default function StudentProfileDetail() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);

    // Mengambil dari tabel mahasiswa dengan join ke users untuk mendapatkan email
    const { data: mhsData, error } = await supabase
      .from('mahasiswa')
      .select('*, users(email)')
      .eq('id', studentId)
      .single();

    if (mhsData) {
      // Menyesuaikan struktur data agar kompatibel dengan JSX yang sudah ada
      const formattedData = {
        ...mhsData,
        nama_lengkap: mhsData.nama_mahasiswa,
        nim_nip: mhsData.nim,
        email: (mhsData as any).users?.email || ''
      };
      setStudent(formattedData);

      // 2. Fetch SA History
      const { data: historyData } = await supabase
        .from('pendaftaran_sa')
        .select(`
          *,
          pendaftaran_items(id)
        `)
        .eq('mahasiswa_id', studentId)
        .order('created_at', { ascending: false });

      if (historyData) setHistory(historyData);
    }
    
    setLoading(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/admin/mahasiswa" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Detail Profil Mahasiswa</h2>
        <p className="text-xs font-semibold text-gray-500">Informasi akademik lengkap & riwayat Semester Antara</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout topbarTitle={topbarTitle}>
        <div className="flex justify-center items-center h-64">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Menarik Data dari Database...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout topbarTitle={topbarTitle}>
        <div className="flex justify-center items-center h-64">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Data Mahasiswa Tidak Ditemukan</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="flex flex-col gap-8">
        
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-12 shadow-sm border border-gray-50">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              {/* Avatar Large */}
              <div className="relative">
                 <div className="h-40 w-40 rounded-[2.5rem] bg-red-50 flex items-center justify-center text-5xl font-black text-red-600 shadow-inner">
                    {getInitials(student.nama_mahasiswa)}
                 </div>
                 <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                 </div>
              </div>

              {/* Identity Info */}
              <div className="flex-grow text-center md:text-left">
                 <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="text-4xl font-black text-[#1A365D]">{student.nama_mahasiswa}</h1>
                 </div>
                 <p className="text-lg font-bold text-gray-400 mb-8 italic">{student.prodi} ({student.jurusan})</p>
                 
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">NIM MAHASISWA</span>
                       <span className="text-lg font-black text-[#1A365D]">{student.nim_nip}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">STATUS</span>
                       <span className="text-lg font-black text-green-600">Aktif</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">EMAIL INSTITUSI</span>
                       <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                          <MailIcon /> {student.email}
                       </div>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">BERGABUNG</span>
                       <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                          <PhoneIcon /> {new Date(student.created_at).getFullYear()}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Decor */}
           <div className="absolute top-0 right-0 h-40 w-40 bg-red-50/50 rounded-bl-[5rem] -z-0"></div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-12 gap-8">
           {/* Left: Academic History */}
           <div className="col-span-8 flex flex-col gap-8">
              <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-50">
                 <h3 className="text-xl font-black text-[#1A365D] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <span className="h-2 w-8 bg-red-600 rounded-full"></span>
                    Riwayat Pendaftaran SA
                 </h3>

                 <div className="space-y-6">
                    {history.length > 0 ? history.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-gray-50 bg-gray-50/30 p-8 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                         <div className="flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                              item.status === 'Approved' ? 'bg-green-600 shadow-green-200' : 
                              item.status === 'Pending' ? 'bg-orange-500 shadow-orange-200' : 'bg-gray-400 shadow-gray-200'
                            }`}>
                               <span className="text-xl font-black">SA</span>
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-[#1A365D]">{item.kode_pendaftaran}</h4>
                               <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                                  {item.pendaftaran_items?.length || 0} Mata Kuliah Terdaftar • Rp {(item.biaya_pendaftaran || 0).toLocaleString('id-ID')}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <span className={`inline-flex rounded-full px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border ${
                              item.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' : 
                              item.status === 'Pending' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                            }`}>
                              {item.status}
                            </span>
                            <p className="text-[10px] font-bold text-gray-300 mt-2">Dibuat pada {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                         </div>
                      </div>
                    )) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 p-8 flex items-center justify-center text-gray-400 italic font-medium">
                         Mahasiswa ini belum pernah mendaftar Semester Antara.
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right: Summary Statistics */}
           <div className="col-span-4 flex flex-col gap-8">
              <div className="rounded-[2rem] bg-[#0F172A] p-10 text-white shadow-xl">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-10">Status Sistem</h4>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="text-sm font-bold text-white">Akun Aktif Terverifikasi</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className={`h-3 w-3 rounded-full ${history.some(h => h.status === 'Approved') ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                       <span className="text-sm font-bold text-white">
                         {history.some(h => h.status === 'Approved') ? 'Punya SA Aktif' : 'Tidak Ada SA Aktif'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
}
