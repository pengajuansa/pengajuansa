"use client";

import React, { useState, useEffect } from 'react';
import DosenLayout from '../../../../../components/DosenLayout';
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

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);

export default function KelolaTugasPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ 
    mk: "Loading...", 
    judul: "", 
    instruksi: "", 
    tanggal: "", 
    waktu: "" 
  });

  useEffect(() => {
    if (params.id) {
      fetchTask(params.id as string);
    }
  }, [params.id]);

  const fetchTask = async (taskId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tugas')
      .select('*, mata_kuliah(nama_mk)')
      .eq('id', taskId)
      .single();

    if (data && !error) {
      let deadlineDate = "";
      let deadlineTime = "";
      if (data.deadline) {
        const d = new Date(data.deadline);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        deadlineDate = `${yyyy}-${mm}-${dd}`;
        
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        deadlineTime = `${hh}:${min}`;
      }
      setFormData({
        mk: data.mata_kuliah?.nama_mk || "Mata Kuliah",
        judul: data.judul || "",
        instruksi: data.deskripsi || "",
        tanggal: deadlineDate,
        waktu: deadlineTime
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Gagal memuat detail tugas.',
        icon: 'error',
        confirmButtonColor: '#1A365D'
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let deadlineStr = null;
    if (formData.tanggal) {
      const timePart = formData.waktu || "00:00";
      deadlineStr = `${formData.tanggal}T${timePart}:00`;
    }

    const { error } = await supabase
      .from('tugas')
      .update({
        judul: formData.judul,
        deskripsi: formData.instruksi,
        deadline: deadlineStr
      })
      .eq('id', params.id);

    if (!error) {
      Swal.fire({
        title: 'Berhasil',
        text: "Perubahan tugas berhasil disimpan!",
        icon: 'success',
        confirmButtonColor: '#1A365D'
      });
      router.push('/dosen/tugas');
    } else {
      Swal.fire({
        title: 'Gagal',
        text: "Gagal menyimpan perubahan: " + error.message,
        icon: 'error',
        confirmButtonColor: '#1A365D'
      });
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: "Apakah Anda yakin ingin menghapus penugasan ini secara permanen?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1A365D',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan'
    });
    
    if (result.isConfirmed) {
      const { error } = await supabase
        .from('tugas')
        .delete()
        .eq('id', params.id);

      if (!error) {
        Swal.fire({
          title: 'Berhasil',
          text: "Tugas berhasil dihapus.",
          icon: 'success',
          confirmButtonColor: '#1A365D'
        });
        router.push('/dosen/tugas');
      } else {
        Swal.fire({
          title: 'Gagal',
          text: "Gagal menghapus tugas: " + error.message,
          icon: 'error',
          confirmButtonColor: '#1A365D'
        });
      }
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/dosen/tugas" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Kelola Tugas</h2>
        <p className="text-xs font-semibold text-gray-500">Edit atau hapus informasi penugasan untuk ID: {params.id}</p>
      </div>
    </div>
  );

  return (
    <DosenLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-[3rem] bg-white p-12 shadow-sm border border-gray-50 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gray-50/50 -z-0"></div>

           <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <span className="inline-flex rounded-full bg-gray-100 px-4 py-1 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 border border-gray-200">Manajemen Panel</span>
                    <h1 className="text-3xl font-black text-[#1A365D]">Opsi Pengelolaan Tugas</h1>
                 </div>
                 <button 
                    onClick={handleDelete}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
                 >
                    <TrashIcon />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                 <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Mata Kuliah</label>
                    <input 
                       type="text" 
                       disabled
                       value={formData.mk}
                       className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold text-gray-400 outline-none shadow-inner"
                    />
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Judul Penugasan</label>
                    <input 
                       type="text" 
                       required
                       value={formData.judul}
                       onChange={(e) => setFormData({...formData, judul: e.target.value})}
                       className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                    />
                 </div>

                 <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Instruksi & Detail</label>
                    <textarea 
                       rows={6}
                       value={formData.instruksi}
                       onChange={(e) => setFormData({...formData, instruksi: e.target.value})}
                       className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner resize-none"
                    ></textarea>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Update Deadline (Tanggal)</label>
                       <input 
                          type="date" 
                          required
                          value={formData.tanggal}
                          onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="flex flex-col gap-4">
                       <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Update Waktu</label>
                       <input 
                          type="time" 
                          required
                          value={formData.waktu}
                          onChange={(e) => setFormData({...formData, waktu: e.target.value})}
                          className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                 </div>

                 <div className="mt-6 flex items-center justify-end gap-6 border-t border-gray-50 pt-10">
                    <Link href="/dosen/tugas" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors">Batalkan</Link>
                    <button 
                       type="submit"
                       className="rounded-2xl bg-[#0B2559] px-12 py-5 text-sm font-black text-white shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest"
                    >
                       <CheckIcon /> Simpan Perubahan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </DosenLayout>
  );
}
