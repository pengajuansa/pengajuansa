"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../../components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, supabaseAuthClient } from '../../../../supabase/lib/supabase';
import Swal from 'sweetalert2';

// Icons
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

export default function TambahDosenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mataKuliahList, setMataKuliahList] = useState<any[]>([]);
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nidn: "",
    nama: "",
    mk_id: "",
    jurusan: "",
    prodi: "",
    status: "Aktif"
  });

  // Fetch data awal
  useEffect(() => {
    fetchMK();
    fetchJurusan();
  }, []);

  // Fetch prodi saat jurusan berubah
  useEffect(() => {
    if (formData.jurusan) {
      fetchProdi(formData.jurusan);
    } else {
      setProdiList([]);
    }
  }, [formData.jurusan]);

  const fetchMK = async () => {
    const { data } = await supabase.from('mata_kuliah').select('id, nama_mk').order('nama_mk', { ascending: true });
    if (data && data.length > 0) {
      setMataKuliahList(data);
      setFormData(prev => ({ ...prev, mk_id: data[0].id }));
    }
  };

  const fetchJurusan = async () => {
    const { data } = await supabase.from('jurusan').select('*').order('nama_jurusan');
    if (data) setJurusanList(data);
  };

  const fetchProdi = async (namaJurusan: string) => {
    const { data: jData } = await supabase.from('jurusan').select('id').eq('nama_jurusan', namaJurusan).single();
    if (jData) {
      const { data } = await supabase.from('prodi').select('*').eq('jurusan_id', jData.id).order('nama_prodi');
      if (data) setProdiList(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailGenerated = `${formData.nidn.replace(/\s+/g, '')}@polimdo.ac.id`;
      const passwordDefault = 'dosen123';

      // 1. DAFTARKAN KE AUTHENTICATION (Menggunakan supabaseAuthClient agar session admin tidak tertimpa)
      const { data: authData, error: authError } = await supabaseAuthClient.auth.signUp({
        email: emailGenerated,
        password: passwordDefault,
        options: {
          data: {
            nama_lengkap: formData.nama,
            role: 'dosen'
          }
        }
      });

      // Jika error "already registered", itu bukan masalah, kita lanjut ambil ID-nya
      if (authError && !authError.message.includes("already registered")) throw authError;

      let userId = authData.user?.id;

      if (!userId) {
        // Coba dapatkan User ID via sign-in dengan supabaseAuthClient jika sudah terdaftar di auth tapi belum di public.users
        const { data: signInData } = await supabaseAuthClient.auth.signInWithPassword({
          email: emailGenerated,
          password: passwordDefault
        }).catch(() => ({ data: { user: null } }));
        userId = signInData?.user?.id;
      }

      // Jika user sudah ada di Auth, ambil ID-nya dari tabel users
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', emailGenerated)
          .single();
        userId = existingUser?.id;
      }

      if (!userId) throw new Error("Gagal mengidentifikasi User ID. Email sudah terdaftar tetapi sandi tidak cocok atau data rusak.");

      // 2. SIMPAN/UPDATE KE TABEL USERS (Gunakan UPSERT agar tidak error duplicate)
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          nim_nip: formData.nidn,
          nama_lengkap: formData.nama,
          email: emailGenerated,
          password: passwordDefault,
          role: 'dosen',
          jurusan: formData.jurusan,
          prodi: formData.prodi
        });

      if (userError) throw userError;

      // 3. SIMPAN/UPDATE KE TABEL DOSEN (Gunakan UPSERT)
      const { error: dosenError } = await supabase
        .from('dosen')
        .upsert({
          id: userId,
          nip: formData.nidn,
          nama_dosen: formData.nama,
          jurusan: formData.jurusan,
          prodi: formData.prodi,
          status: formData.status
        });

      if (dosenError) throw dosenError;

      // 4. ALOKASI MATA KULIAH
      if (formData.mk_id) {
        await supabase
          .from('alokasi_dosen')
          .upsert({
            dosen_id: userId,
            mk_id: formData.mk_id,
            tahun_akademik: '2023/2024'
          }, { onConflict: 'dosen_id,mk_id' });
      }

      Swal.fire({
      title: 'Berhasil',
      text: `Data Dosen berhasil disimpan!\nEmail: ${emailGenerated}\nStatus: Akun aktif`,
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push('/admin/dosen');
    } catch (err: any) {
      Swal.fire({
      title: 'Gagal',
      text: "Gagal memproses data dosen: " + err.message,
      icon: 'error',
      confirmButtonColor: '#1A365D'
    });
    } finally {
      setLoading(false);
    }
  };

  const topbarTitle = (
    <div className="flex items-center gap-4">
      <Link href="/admin/dosen" className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-red-600 shadow-sm border border-gray-100 transition-all">
        <ArrowLeftIcon />
      </Link>
      <div>
        <h2 className="m-0 text-xl font-extrabold text-[#1A365D]">Tambah Dosen Baru</h2>
        <p className="text-xs font-semibold text-gray-500">Daftarkan tenaga pendidik baru ke dalam sistem master data</p>
      </div>
    </div>
  );

  return (
    <AdminLayout topbarTitle={topbarTitle}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl md:rounded-[3rem] bg-white p-6 md:p-12 shadow-sm border border-gray-50 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-50/30 -z-0"></div>

          <div className="relative z-10">
            <div className="mb-12">
              <span className="inline-flex rounded-full bg-red-50 px-4 py-1 text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 border border-red-100">Registrasi Master</span>
              <h1 className="text-3xl font-black text-[#1A365D]">Lengkapi Informasi Dosen</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1 flex items-center gap-2">
                    NIDN / Nomor Induk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nidn}
                    onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                    placeholder="Masukkan NIDN dosen..."
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Status Keaktifan</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all appearance-none shadow-inner"
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
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Dr. Ahmad Sulaiman, M.T."
                  className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Jurusan <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      required
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value, prodi: "" })}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all appearance-none shadow-inner"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusanList.map((j) => (
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
                      onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
                      disabled={!formData.jurusan}
                      className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all appearance-none shadow-inner disabled:opacity-50"
                    >
                      <option value="">Pilih Prodi</option>
                      {prodiList.map((p) => (
                        <option key={p.id} value={p.nama_prodi}>{p.nama_prodi}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-xs font-black text-[#1A365D] uppercase tracking-widest ml-1">Mata Kuliah Pengampu</label>
                <div className="relative">
                  <select
                    value={formData.mk_id}
                    onChange={(e) => setFormData({ ...formData, mk_id: e.target.value })}
                    className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-7 py-5 text-sm font-bold outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all appearance-none shadow-inner"
                    disabled={mataKuliahList.length === 0}
                  >
                    {mataKuliahList.length === 0 ? (
                      <option value="">Memuat mata kuliah...</option>
                    ) : (
                      mataKuliahList.map((mk) => (
                        <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 border-t border-gray-50 pt-8 md:pt-10">
                <Link href="/admin/dosen" className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors text-center">Batalkan</Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-red-600 px-8 md:px-12 py-4 md:py-5 text-sm font-black text-white shadow-2xl shadow-red-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                  <CheckIcon /> {loading ? 'Menyimpan...' : 'Simpan Data Dosen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
