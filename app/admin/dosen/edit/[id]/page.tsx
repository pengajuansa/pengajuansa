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

export default function EditDosenPage() {
  const router = useRouter();
  const params = useParams();
  const dosenId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [filteredProdi, setFilteredProdi] = useState<any[]>([]);
  const [alokasiId, setAlokasiId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nidn: "",
    nama: "",
    mk_id: "",
    jurusan: "",
    prodi: "",
    status: "Aktif"
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Filter prodi saat jurusan berubah
  useEffect(() => {
    if (formData.jurusan) {
      const selectedJurusan = jurusanList.find(j => j.nama_jurusan === formData.jurusan);
      if (selectedJurusan) {
        setFilteredProdi(prodiList.filter(p => p.jurusan_id === selectedJurusan.id));
      }
    } else {
      setFilteredProdi([]);
    }
  }, [formData.jurusan, jurusanList, prodiList]);

  const fetchInitialData = async () => {
    setLoading(true);

    // 1. Fetch Referensi
    const { data: mkData } = await supabase.from('mata_kuliah').select('id, nama_mk').order('nama_mk', { ascending: true });
    const { data: jurData } = await supabase.from('jurusan').select('*').order('nama_jurusan');
    const { data: prodData } = await supabase.from('prodi').select('*').order('nama_prodi');
    
    if (mkData) setMataKuliahList(mkData);
    if (jurData) setJurusanList(jurData);
    if (prodData) setProdiList(prodData);

    // 2. Ambil data dosen dari tabel users
    const { data: userData } = await supabase.from('users').select('*').eq('id', dosenId).single();

    if (userData) {
      const { data: alokasiData } = await supabase.from('alokasi_dosen').select('*').eq('dosen_id', dosenId).single();
      if (alokasiData) setAlokasiId(alokasiData.id);

      setFormData({
        nidn: userData.nim_nip || "",
        nama: userData.nama_lengkap || "",
        jurusan: userData.jurusan || "",
        prodi: userData.prodi || "",
        mk_id: alokasiData ? alokasiData.mk_id : "",
        status: "Aktif"
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update data dosen di tabel users
      const { error: userError } = await supabase
        .from('users')
        .update({
          nim_nip: formData.nidn,
          nama_lengkap: formData.nama,
          jurusan: formData.jurusan,
          prodi: formData.prodi
        })
        .eq('id', dosenId);
      if (userError) throw userError;

      // 2. Sync ke tabel dosen
      await supabase.from('dosen').upsert({
        id: dosenId,
        nip: formData.nidn,
        nama_dosen: formData.nama,
        jurusan: formData.jurusan,
        prodi: formData.prodi,
        status: formData.status
      });

      // 3. Update alokasi mata kuliah
      if (formData.mk_id) {
        if (alokasiId) {
          await supabase.from('alokasi_dosen').update({ mk_id: formData.mk_id }).eq('id', alokasiId);
        } else {
          await supabase.from('alokasi_dosen').insert({
            dosen_id: dosenId,
            mk_id: formData.mk_id,
            tahun_akademik: '2023/2024'
          });
        }
      }

      Swal.fire({
      title: 'Berhasil',
      text: "Perubahan berhasil disimpan!",
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push('/admin/dosen');
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
      <Link href="/admin/dosen" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Edit Informasi Dosen</h2>
        <p className="text-xs font-semibold text-gray-500">Perbarui data master untuk NIP: {formData.nidn || "Memuat..."}</p>
      </div>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-50/30 -z-0"></div>

          <div className="relative z-10">
            <div className="mb-12">
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-1 text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 border border-blue-100">Update Data</span>
              <h1 className="text-3xl font-black text-[#1A365D]">Perbarui Detail Dosen</h1>
            </div>

            {loading ? (
              <div className="py-20 text-center animate-pulse">
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest">Menarik Data dari Database...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1 flex items-center gap-2">
                      NIP / Nomor Induk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required
                      value={formData.nidn}
                      onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Status Keaktifan</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none shadow-inner"
                      >
                        <option>Aktif</option>
                        <option>Cuti</option>
                        <option>Tugas Belajar</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Nama Lengkap Beserta Gelar <span className="text-red-500">*</span></label>
                  <input
                    type="text" required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Jurusan</label>
                    <select
                      required
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value, prodi: "" })}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map(j => (
                        <option key={j.id} value={j.nama_jurusan}>{j.nama_jurusan}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Program Studi</label>
                    <select
                      required
                      disabled={!formData.jurusan}
                      value={formData.prodi}
                      onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all appearance-none disabled:opacity-50"
                    >
                      <option value="">Pilih Prodi</option>
                      {filteredProdi.map(p => (
                        <option key={p.id} value={p.nama_prodi}>{p.nama_prodi}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Mata Kuliah Pengampu</label>
                  <select
                    value={formData.mk_id}
                    onChange={(e) => setFormData({ ...formData, mk_id: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all"
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {mataKuliahList.map((mk) => (
                      <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 border-t border-gray-50 pt-8 md:pt-10">
                  <Link href="/admin/dosen" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors text-center">Batalkan</Link>
                  <button
                    type="submit" disabled={saving}
                    className="rounded-2xl bg-blue-600 px-8 md:px-12 py-4 md:py-5 text-sm font-black text-white shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                  >
                    <CheckIcon /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
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
