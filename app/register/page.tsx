"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase/lib/supabase';
import { UniversityIcon, UserIcon, LockIcon, EyeIcon, ArrowRightIcon } from '../../components/login-icons';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [prodiList, setProdiList] = useState<any[]>([]);
  const [filteredProdi, setFilteredProdi] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    email: '',
    password: '',
    jurusan: '',
    prodi: '',
    ipk: '',
    semester: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

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
    const { data: jurusans } = await supabase.from('jurusan').select('*').order('nama_jurusan');
    const { data: prodis } = await supabase.from('prodi').select('*').order('nama_prodi');
    if (jurusans) setJurusanList(jurusans);
    if (prodis) setProdiList(prodis);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Daftar ke Supabase Auth (Standard)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'mahasiswa',
            nama_lengkap: formData.nama
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Gagal membuat akun autentikasi.");

      const authUserId = authData.user.id;

      // 2. Simpan ke tabel users (Public Profile)
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authUserId, // Gunakan ID dari Auth
          email: formData.email,
          password: formData.password, // Tetap simpan untuk legacy jika perlu, tapi Auth yang utama
          nim_nip: formData.nim,
          nama_lengkap: formData.nama,
          role: 'mahasiswa',
          jurusan: formData.jurusan,
          prodi: formData.prodi,
          ipk: parseFloat(formData.ipk) || 0,
          semester: parseInt(formData.semester) || 1
        });

      if (userError) throw userError;

      // 3. Sinkronisasi manual ke tabel mahasiswa
      const { error: mhsError } = await supabase
        .from('mahasiswa')
        .insert({
          id: authUserId,
          nim: formData.nim,
          nama_mahasiswa: formData.nama,
          jurusan: formData.jurusan,
          prodi: formData.prodi,
          ipk: parseFloat(formData.ipk) || 0,
          semester: parseInt(formData.semester) || 1
        });

      if (mhsError) {
        console.warn("Trigger mungkin sudah menangani tabel mahasiswa.");
      }

      Swal.fire({
      title: 'Berhasil',
      text: "Pendaftaran Berhasil! Silakan cek email Anda (jika konfirmasi email aktif) atau langsung login.",
      icon: 'success',
      confirmButtonColor: '#1A365D'
    });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#11151e] font-sans text-white overflow-hidden">
      
      {/* Left Column - Register Form */}
      <div className="flex w-full flex-col items-center justify-center p-4 sm:p-8 lg:w-1/2 animate-in fade-in slide-in-from-left duration-700">
        <div className="w-full max-w-lg rounded-3xl bg-[#1c212d] p-6 sm:p-12 shadow-2xl relative border border-white/5">
          
          {/* Header & Logo */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-900/40">
                <UniversityIcon />
              </div>
            </div>
            <h2 className="mb-2 text-2xl sm:text-3xl font-black text-white tracking-tight">Daftar Akun Baru</h2>
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-blue-500/50"></div>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-blue-400 font-black">
                Portal Pendaftaran Semester Antara POLIMDO
              </p>
              <div className="h-px w-8 bg-blue-500/50"></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 sm:p-4 text-[10px] sm:text-xs font-bold text-red-400 animate-bounce">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Nama Lengkap */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">NAMA LENGKAP</label>
              <div className="relative">
                <input
                  type="text" required
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            {/* NIM & Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">NIM</label>
              <input
                type="text" required
                value={formData.nim}
                onChange={(e) => setFormData({...formData, nim: e.target.value})}
                placeholder="22041..."
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">EMAIL</label>
              <input
                type="email" required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="mhs@polimdo.ac.id"
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">KATA SANDI</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Min. 8 karakter"
                  className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  <EyeIcon />
                </button>
              </div>
            </div>

            {/* Jurusan & Prodi */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">JURUSAN</label>
              <select
                required
                value={formData.jurusan}
                onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
              >
                <option value="">Pilih Jurusan</option>
                {jurusanList.map(j => <option key={j.id} value={j.nama_jurusan}>{j.nama_jurusan}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">PRODI</label>
              <select
                required
                disabled={!formData.jurusan}
                value={formData.prodi}
                onChange={(e) => setFormData({...formData, prodi: e.target.value})}
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Pilih Prodi</option>
                {filteredProdi.map(p => <option key={p.id} value={p.nama_prodi}>{p.nama_prodi}</option>)}
              </select>
            </div>

            {/* IPK & Semester */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">IPK TERAKHIR</label>
              <input
                type="number" step="0.01" required
                value={formData.ipk}
                onChange={(e) => setFormData({...formData, ipk: e.target.value})}
                placeholder="0.00"
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">SEMESTER</label>
              <input
                type="number" required
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                placeholder="1"
                className="w-full rounded-xl bg-[#262c3a] py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 md:col-span-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-4 text-xs font-black text-white shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            >
              {loading ? "Mendaftarkan..." : "Daftar Akun Sekarang"}
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              Sudah punya akun? {' '}
              <Link href="/login" className="text-[#FACC15] hover:underline">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image & Overlay */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block animate-in fade-in slide-in-from-right duration-1000">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-110"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2098&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-[#0f172a]/70" />

        <div className="absolute top-1/2 left-16 right-16 -translate-y-1/2 flex flex-col items-start text-white">
          <div className="mb-8 rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1635350736475-c8cef4b21906?q=80&w=2070&auto=format&fit=crop" 
              alt="Decoration" 
              className="h-32 w-48 object-cover rounded-xl"
            />
          </div>
          <span className="mb-4 text-xs font-bold uppercase tracking-widest text-[#FACC15]">
            Mulai Langkah Akademik Anda
          </span>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-white">
            Ekosistem Digital Mahasiswa POLIMDO.
          </h1>
          <div className="mb-6 h-1 w-24 bg-blue-500"></div>
          <p className="max-w-xl text-lg leading-relaxed text-gray-200">
            Satu portal untuk semua kebutuhan pendaftaran Semester Antara dan pengelolaan tugas perkuliahan Anda.
          </p>
        </div>
        
        {/* Decorative Badge */}
        <div className="absolute bottom-12 right-12 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white animate-spin-slow">
            <p className="text-[8px] font-black uppercase text-center tracking-widest">Digital • Portal • Polimdo • SA</p>
        </div>
      </div>
    </div>
  );
}
