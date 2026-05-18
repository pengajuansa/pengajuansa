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

export default function EditMKPage() {
  const router = useRouter();
  const params = useParams();
  const mkId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({ 
    kode: "", 
    nama: "", 
    sks: "3", 
    semester: "1", 
    jurusan: "",
    prodi: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, [mkId]);

  useEffect(() => {
    if (formData.jurusan) {
      fetchProdi(formData.jurusan);
    } else {
      setProdiList([]);
    }
  }, [formData.jurusan]);

  const fetchInitialData = async () => {
    setLoading(true);
    
    // Fetch Jurusan List
    const { data: jList } = await supabase
      .from('jurusan')
      .select('*')
      .order('nama_jurusan');
    if (jList) setJurusanList(jList);

    // Fetch MK Data
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select('*')
      .eq('id', mkId)
      .single();

    if (data) {
      setFormData({
        kode: data.kode_mk || "",
        nama: data.nama_mk || "",
        sks: data.sks?.toString() || "3",
        semester: data.semester_asal?.toString() || "1",
        jurusan: data.jurusan || "",
        prodi: data.prodi || ""
      });
      
      if (data.jurusan) {
        await fetchProdi(data.jurusan);
      }
    } else if (error) {
      Swal.fire({
      title: 'Gagal',
      text: "Gagal memuat data: " + error.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
    }
    setLoading(false);
  };

  const fetchProdi = async (namaJurusan: string) => {
    const { data: jData } = await supabase
      .from('jurusan')
      .select('id')
      .eq('nama_jurusan', namaJurusan)
      .single();

    if (jData) {
      const { data } = await supabase
        .from('prodi')
        .select('*')
        .eq('jurusan_id', jData.id)
        .order('nama_prodi');
      
      if (data) setProdiList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('mata_kuliah')
        .update({
          kode_mk: formData.kode,
          nama_mk: formData.nama,
          sks: parseInt(formData.sks),
          semester_asal: parseInt(formData.semester),
          jurusan: formData.jurusan,
          prodi: formData.prodi
        })
        .eq('id', mkId);

      if (error) throw error;

      Swal.fire({
      title: 'Berhasil',
      text: "Perubahan mata kuliah berhasil disimpan!",
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push('/admin/mata-kuliah');
    } catch (err: any) {
      Swal.fire({
      title: 'Gagal',
      text: "Gagal menyimpan perubahan: " + err.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
    } finally {
      setSaving(false);
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/admin/mata-kuliah" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Edit Mata Kuliah</h2>
        <p className="text-xs font-semibold text-gray-500">Perbarui informasi kurikulum untuk ID: {formData.kode || "Memuat..."}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
           {/* Decor */}
           <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-50/30 -z-0"></div>

           <div className="relative z-10">
              <div className="mb-12">
                 <span className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 border border-blue-100">Update Kurikulum</span>
                 <h1 className="text-3xl font-black text-[#1A365D]">Perbarui Detail Mata Kuliah</h1>
              </div>

              {loading ? (
                <div className="py-20 text-center animate-pulse">
                  <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Menarik Data dari Database...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1 flex items-center gap-2">
                            Kode MK <span className="text-red-500">*</span>
                         </label>
                         <input 
                            type="text" 
                            required
                            value={formData.kode}
                            onChange={(e) => setFormData({...formData, kode: e.target.value})}
                            placeholder="Contoh: TI-402"
                            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                         />
                      </div>

                      <div className="col-span-2 flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Nama Mata Kuliah <span className="text-red-500">*</span></label>
                         <input 
                            type="text" 
                            required
                            value={formData.nama}
                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                            placeholder="Contoh: Pemrograman Web Lanjut"
                            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Bobot SKS</label>
                         <div className="relative">
                            <select 
                               value={formData.sks}
                               onChange={(e) => setFormData({...formData, sks: e.target.value})}
                               className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner"
                            >
                               <option value="1">1 SKS</option>
                               <option value="2">2 SKS</option>
                               <option value="3">3 SKS</option>
                               <option value="4">4 SKS</option>
                               <option value="6">6 SKS</option>
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Semester Asal</label>
                         <div className="relative">
                            <select 
                               value={formData.semester}
                               onChange={(e) => setFormData({...formData, semester: e.target.value})}
                               className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner"
                            >
                               {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Jurusan <span className="text-red-500">*</span></label>
                         <div className="relative">
                            <select 
                               required
                               value={formData.jurusan}
                               onChange={(e) => setFormData({...formData, jurusan: e.target.value, prodi: ""})}
                               className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner"
                            >
                               <option value="">Pilih Jurusan</option>
                               {jurusanList.map(j => (
                                 <option key={j.id} value={j.nama_jurusan}>{j.nama_jurusan}</option>
                               ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-4">
                         <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Program Studi <span className="text-red-500">*</span></label>
                         <div className="relative">
                            <select 
                               required
                               value={formData.prodi}
                               onChange={(e) => setFormData({...formData, prodi: e.target.value})}
                               disabled={!formData.jurusan}
                               className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner disabled:opacity-50"
                            >
                               <option value="">Pilih Prodi</option>
                               {prodiList.map(p => (
                                 <option key={p.id} value={p.nama_prodi}>{p.nama_prodi}</option>
                               ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 border-t border-gray-50 pt-8 md:pt-10">
                      <Link href="/admin/mata-kuliah" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors text-center">Batalkan</Link>
                      <button 
                         type="submit"
                         disabled={saving}
                         className="rounded-2xl bg-blue-600 px-8 md:px-12 py-4 md:py-5 text-sm font-black text-white shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                      >
                         <CheckIcon /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                   </div>
                </form>
              )}
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
