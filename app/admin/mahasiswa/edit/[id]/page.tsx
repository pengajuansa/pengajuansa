"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../../../components/AdminLayout';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../../supabase/lib/supabase';
import Swal from 'sweetalert2';

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function EditMahasiswaPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ 
    nim: "", 
    nama: "", 
    prodi: "", 
    jurusan: "",
    semester: "",
    ipk: "",
    email: ""
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const { data: mhsData, error } = await supabase
        .from('mahasiswa')
        .select('*, users(email)')
        .eq('id', studentId)
        .single();

      if (mhsData && !error) {
        setFormData({
          nim: mhsData.nim || "",
          nama: mhsData.nama_mahasiswa || "",
          prodi: mhsData.prodi || "",
          jurusan: mhsData.jurusan || "",
          semester: (mhsData.semester || "1").toString(),
          ipk: (mhsData.ipk || "0").toString(),
          email: (mhsData as any).users?.email || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update Tabel Mahasiswa
      const { error: mhsError } = await supabase
        .from('mahasiswa')
        .update({
          nim: formData.nim,
          nama_mahasiswa: formData.nama,
          prodi: formData.prodi,
          jurusan: formData.jurusan,
          semester: parseInt(formData.semester),
          ipk: parseFloat(formData.ipk)
        })
        .eq('id', studentId);

      if (mhsError) throw mhsError;

      // 2. Update Tabel Users (untuk email dan sinkronisasi)
      const { error: userError } = await supabase
        .from('users')
        .update({
          email: formData.email,
          nama_lengkap: formData.nama,
          nim_nip: formData.nim,
          prodi: formData.prodi,
          jurusan: formData.jurusan,
          semester: parseInt(formData.semester),
          ipk: parseFloat(formData.ipk)
        })
        .eq('id', studentId);

      if (userError) throw userError;

      Swal.fire({
      title: 'Berhasil',
      text: "Profil mahasiswa berhasil diperbarui!",
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push(`/admin/mahasiswa/${studentId}`);
    } catch (error: any) {
      Swal.fire({
      title: 'Gagal',
      text: "Gagal memperbarui data: " + error.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data mahasiswa beserta seluruh riwayat pendaftarannya akan dihapus secara permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // 1. Hapus dari tabel mahasiswa terlebih dahulu
      await supabase.from('mahasiswa').delete().eq('id', studentId);
      
      // 2. Hapus dari tabel users
      const { error } = await supabase.from('users').delete().eq('id', studentId);

      if (error) throw error;

      Swal.fire({
        title: 'Terhapus!',
        text: 'Mahasiswa berhasil dihapus dari sistem.',
        icon: 'success',
        confirmButtonColor: '#1A365D'
      });
      router.push('/admin/mahasiswa');
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        title: 'Gagal',
        text: 'Gagal menghapus mahasiswa: ' + error.message,
        icon: 'error',
        confirmButtonColor: '#1A365D'
      });
    } finally {
      setSaving(false);
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href={`/admin/mahasiswa/${studentId}`} className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Edit Profil Mahasiswa</h2>
        <p className="text-xs font-semibold text-gray-500">Perbarui identitas dan informasi akademik mahasiswa</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout topbarTitle={topbarTitle}>
        <div className="flex justify-center items-center h-64 font-bold text-gray-400 animate-pulse uppercase tracking-widest">
          Memuat Data Dari Database...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-50/30 -z-0"></div>

           <div className="relative z-10">
              <div className="mb-12">
                 <span className="inline-flex rounded-full bg-red-50 px-4 py-1 text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 border border-red-100">Update Profil</span>
                 <h1 className="text-3xl font-black text-[#1A365D]">Modifikasi Data Mahasiswa</h1>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Nomor Induk Mahasiswa (NIM)</label>
                       <input 
                          type="text" 
                          required
                          value={formData.nim}
                          onChange={(e) => setFormData({...formData, nim: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">IPK Saat Ini</label>
                       <input 
                          type="text" 
                          required
                          value={formData.ipk}
                          onChange={(e) => setFormData({...formData, ipk: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner text-green-600"
                       />
                    </div>
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Nama Lengkap Mahasiswa <span className="text-red-500">*</span></label>
                    <input 
                       type="text" 
                       required
                       value={formData.nama}
                       onChange={(e) => setFormData({...formData, nama: e.target.value})}
                       className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Program Studi</label>
                       <input 
                          type="text"
                          required
                          value={formData.prodi}
                          onChange={(e) => setFormData({...formData, prodi: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Semester</label>
                       <select 
                          value={formData.semester}
                          onChange={(e) => setFormData({...formData, semester: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all appearance-none shadow-inner"
                       >
                          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Email Mahasiswa</label>
                       <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                 </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-gray-50 pt-8 md:pt-10">
                     
                      {/* Left: Delete Button */}
                      <button
                         type="button"
                         onClick={handleDelete}
                         disabled={saving}
                         className="rounded-2xl bg-red-50 text-red-600 px-6 py-4 text-xs font-black hover:bg-red-600 hover:text-white active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50 text-center flex items-center justify-center gap-2 border border-red-200"
                      >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                         Hapus Mahasiswa
                      </button>

                      {/* Right: Cancel & Save Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                         <Link href={`/admin/mahasiswa/${studentId}`} className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors text-center py-2 px-4 flex items-center justify-center">Batalkan</Link>
                         <button 
                            type="submit"
                            disabled={saving}
                            className="rounded-2xl bg-[#1A365D] px-8 md:px-12 py-4 md:py-5 text-sm font-black text-white shadow-2xl shadow-blue-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                         >
                            <CheckIcon /> {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
                         </button>
                      </div>

                  </div>
              </form>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
