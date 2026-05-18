"use client";

import React, { useState, useEffect } from 'react';
import DosenLayout from '../../../../components/DosenLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase/lib/supabase';
import Swal from 'sweetalert2';

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function BuatTugasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mkList, setMkList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    mk: "", 
    mahasiswa: "",
    judul: "", 
    instruksi: "", 
    tanggal: "", 
    waktu: "" 
  });
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchMKList();
  }, []);

  const fetchMKList = async () => {
    setLoading(true);
    const userStr = localStorage.getItem('user');
    if (!userStr) { setLoading(false); return; }
    const user = JSON.parse(userStr);

    const { data: alokasi } = await supabase
      .from('alokasi_dosen')
      .select('mk_id, mata_kuliah(id, nama_mk)')
      .eq('dosen_id', user.id);

    if (alokasi && alokasi.length > 0) {
      // Pastikan list MK unik
      const uniqueMks: any[] = [];
      const mkIds = new Set();
      
      alokasi.forEach((a: any) => {
        if (a.mata_kuliah && !mkIds.has(a.mk_id)) {
          mkIds.add(a.mk_id);
          uniqueMks.push(a.mata_kuliah);
        }
      });

      setMkList(uniqueMks);
      if (uniqueMks.length > 0) {
        const firstMK = uniqueMks[0].id;
        setFormData(prev => ({ ...prev, mk: firstMK }));
        fetchStudents(firstMK);
      }
    }
    setLoading(false);
  };

  const fetchStudents = async (mkId: string) => {
    const { data } = await supabase
      .from('pendaftaran_items')
      .select('pendaftaran_sa(mahasiswa:mahasiswa_id(id, nama_mahasiswa, nim))')
      .eq('mk_id', mkId);

    if (data) {
      const list = data.map((d: any) => (d.pendaftaran_sa as any)?.mahasiswa).filter(Boolean);
      
      // Pastikan list mahasiswa unik berdasarkan ID untuk menghindari error React key
      const uniqueStudents = Array.from(new Map(list.map((s: any) => [s.id, s])).values());
      
      setStudents(uniqueStudents);
      if (uniqueStudents.length > 0) {
        setFormData(prev => ({ ...prev, mahasiswa: uniqueStudents[0].id }));
      }
    }
  };

  useEffect(() => {
    if (formData.mk) {
      fetchStudents(formData.mk);
    }
  }, [formData.mk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mk) {
      Swal.fire({
      title: 'Informasi',
      text: "Silakan pilih mata kuliah terlebih dahulu.",
      icon: 'warning',
      confirmButtonColor: '#1A365D'
    });
      return;
    }

    setSubmitting(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Setup format deadline timestamp
    let deadlineTimestamp = null;
    if (formData.tanggal && formData.waktu) {
      deadlineTimestamp = new Date(`${formData.tanggal}T${formData.waktu}`).toISOString();
    }

    const { error } = await supabase.from('tugas').insert({
      mk_id: formData.mk,
      dosen_id: user?.id,
      mahasiswa_id: formData.mahasiswa,
      judul: formData.judul,
      deskripsi: formData.instruksi,
      deadline: deadlineTimestamp
    });

    if (!error) {
      // Send Email Notification
      try {
        const { data: mhsUser } = await supabase.from('users').select('email').eq('id', formData.mahasiswa).single();
        if (mhsUser && mhsUser.email) {
          const mkName = mkList.find(m => m.id === formData.mk)?.nama_mk || 'Mata Kuliah';
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: mhsUser.email,
              subject: `Tugas Baru: ${formData.judul} - ${mkName}`,
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <h2 style="color: #1A365D;">Pemberitahuan Tugas Baru Semester Antara</h2>
                  <p>Halo,</p>
                  <p>Dosen Anda telah mempublikasikan tugas baru untuk mata kuliah <strong>${mkName}</strong>.</p>
                  <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1A365D; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #0F172A;">${formData.judul}</h3>
                    <p><strong>Batas Waktu:</strong> ${formData.tanggal ? `${formData.tanggal} pukul ${formData.waktu}` : 'Tidak ditentukan'}</p>
                    <p><strong>Instruksi:</strong></p>
                    <p style="white-space: pre-wrap;">${formData.instruksi || 'Tidak ada instruksi khusus.'}</p>
                  </div>
                  <p>Silakan login ke portal aplikasi untuk melihat dan mengumpulkan tugas Anda.</p>
                  <p>Salam,<br/>Tim Akademik Pans Garage</p>
                </div>
              `
            })
          });
        }
      } catch (err) {
        console.error("Failed to send email", err);
      }

      setSubmitting(false);
      Swal.fire({
      title: 'Berhasil',
      text: "Tugas baru berhasil dipublikasikan!",
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push('/dosen/tugas');
    } else {
      setSubmitting(false);
      Swal.fire({
      title: 'Gagal',
      text: "Gagal mempublikasikan tugas: " + error.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/dosen/tugas" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Buat Tugas Baru</h2>
        <p className="text-xs font-semibold text-gray-500">Publikasikan instruksi penugasan untuk mahasiswa Semester Antara</p>
      </div>
    </div>
  );

  return (
    <DosenLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-50/30 -z-0"></div>

           <div className="relative z-10">
              <div className="mb-12">
                 <span className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 border border-blue-100">Portal Penugasan</span>
                 <h1 className="text-3xl font-black text-[#1A365D]">Detail Penugasan Baru</h1>
              </div>

              {loading ? (
                 <div className="py-20 text-center text-sm font-black text-gray-400 uppercase tracking-widest">
                    Memuat Form & Mata Kuliah...
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Mata Kuliah <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <select 
                              required
                              value={formData.mk}
                              onChange={(e) => setFormData({...formData, mk: e.target.value})}
                              className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner text-[#1A365D]"
                           >
                              {mkList.map(mk => (
                                 <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>
                              ))}
                           </select>
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Mahasiswa Penerima <span className="text-red-500">*</span></label>
                        <div className="relative">
                           <select 
                              required
                              value={formData.mahasiswa}
                              onChange={(e) => setFormData({...formData, mahasiswa: e.target.value})}
                              className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner text-[#1A365D]"
                           >
                              {students.length > 0 ? students.map(s => (
                                 <option key={s.id} value={s.id}>{s.nama_mahasiswa} ({s.nim})</option>
                              )) : (
                                 <option value="">Tidak ada mahasiswa terdaftar</option>
                              )}
                           </select>
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-col gap-4">
                      <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Judul Penugasan <span className="text-red-500">*</span></label>
                      <input 
                         type="text" 
                         required
                         value={formData.judul}
                         onChange={(e) => setFormData({...formData, judul: e.target.value})}
                         placeholder="Contoh: Implementasi State Management"
                         className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner text-[#1A365D]"
                      />
                   </div>

                   <div className="flex flex-col gap-4">
                      <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Instruksi & Detail Pengerjaan</label>
                      <textarea 
                         rows={6}
                         value={formData.instruksi}
                         onChange={(e) => setFormData({...formData, instruksi: e.target.value})}
                         placeholder="Berikan instruksi yang jelas kepada mahasiswa..."
                         className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner resize-none text-[#1A365D]"
                      ></textarea>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Batas Tanggal (Deadline)</label>
                         <input 
                            type="date" 
                            required
                            value={formData.tanggal}
                            onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner text-[#1A365D]"
                         />
                      </div>
                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Batas Waktu</label>
                         <input 
                            type="time" 
                            required
                            value={formData.waktu}
                            onChange={(e) => setFormData({...formData, waktu: e.target.value})}
                            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner text-[#1A365D]"
                         />
                      </div>
                   </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 border-t border-gray-50 pt-8 md:pt-10">
                       <Link href="/dosen/tugas" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors text-center">Batalkan</Link>
                       <button 
                          type="submit"
                          disabled={submitting}
                          className={`rounded-2xl px-8 md:px-12 py-4 md:py-5 text-sm font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0B2559] shadow-blue-900/30 hover:scale-[1.02] active:scale-95'}`}
                       >
                          {submitting ? (
                            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Memproses...</>
                          ) : (
                            <><CheckIcon /> Publikasikan Tugas</>
                          )}
                       </button>
                    </div>
                </form>
              )}
           </div>
        </div>
      </div>
    </DosenLayout>
  );
}
